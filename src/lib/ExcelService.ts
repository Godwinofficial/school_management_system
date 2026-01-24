import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ValidationError {
    row: number;
    field: string;
    message: string;
    value?: any;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    validRows: number;
    totalRows: number;
}

export interface Teacher {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    tsNumber?: string;
    nrc?: string;
    dateOfBirth?: string;
    gender: 'M' | 'F';
    address?: string;
    qualifications?: string;
    joinedDate?: string;
}

export interface Student {
    id?: string;
    studentId?: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'Male' | 'Female';
    gradeLevel: number;
    stream?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianEmail?: string;
    address?: string;
    medicalInfo?: string;
    enrollmentDate?: string;
}

export interface Class {
    id?: string;
    className: string;
    gradeLevel: number;
    stream?: string;
    capacity: number;
    teacherName?: string;
    subjects?: string[];
    roomNumber?: string;
    schedule?: string;
}

export interface GradeRange {
    minScore: number;
    maxScore: number;
    letterGrade: string;
    gradePoint?: number;
    description?: string;
    passFail: 'Pass' | 'Fail';
}

export interface GradingSystem {
    name: string;
    ranges: GradeRange[];
}

export class ExcelService {
    // ==================== STUDENT OPERATIONS ====================

    static exportStudentsToExcel(students: Student[], filename: string = 'students.xlsx'): void {
        const worksheet = XLSX.utils.json_to_sheet(students.map(s => ({
            'Student ID': s.studentId || s.id || '',
            'First Name': s.firstName,
            'Last Name': s.lastName,
            'Date of Birth': s.dateOfBirth,
            'Gender': s.gender,
            'Grade Level': s.gradeLevel,
            'Stream': s.stream || '',
            'Guardian Name': s.guardianName || '',
            'Guardian Phone': s.guardianPhone || '',
            'Guardian Email': s.guardianEmail || '',
            'Address': s.address || '',
            'Medical Info': s.medicalInfo || '',
            'Enrollment Date': s.enrollmentDate || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, filename);
    }

    static async importStudentsFromExcel(file: File): Promise<{ data: Student[], validation: ValidationResult }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const students: Student[] = [];
                    const errors: ValidationError[] = [];

                    jsonData.forEach((row: any, index: number) => {
                        const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header row

                        // Validate required fields
                        if (!row['First Name']) {
                            errors.push({ row: rowNumber, field: 'First Name', message: 'First Name is required' });
                        }
                        if (!row['Last Name']) {
                            errors.push({ row: rowNumber, field: 'Last Name', message: 'Last Name is required' });
                        }
                        if (!row['Date of Birth']) {
                            errors.push({ row: rowNumber, field: 'Date of Birth', message: 'Date of Birth is required' });
                        }
                        if (!row['Gender']) {
                            errors.push({ row: rowNumber, field: 'Gender', message: 'Gender is required' });
                        }
                        if (!row['Grade'] && !row['Grade Level']) {
                            errors.push({ row: rowNumber, field: 'Grade', message: 'Grade is required' });
                        }

                        // Validate data types and formats
                        const gradeVal = row['Grade'] || row['Grade Level'];
                        if (gradeVal && (parseInt(gradeVal) < 1 || parseInt(gradeVal) > 12)) {
                            errors.push({ row: rowNumber, field: 'Grade', message: 'Grade must be between 1 and 12', value: gradeVal });
                        }

                        const gender = row['Gender']?.toString().toUpperCase();
                        if (gender && !['M', 'F', 'MALE', 'FEMALE'].includes(gender)) {
                            errors.push({ row: rowNumber, field: 'Gender', message: 'Gender must be M/F or Male/Female', value: row['Gender'] });
                        }

                        // Validate email format if provided
                        if (row['Guardian Email'] && !isValidEmail(row['Guardian Email'])) {
                            errors.push({ row: rowNumber, field: 'Guardian Email', message: 'Invalid email format', value: row['Guardian Email'] });
                        }

                        // If no critical errors for this row, add to students array
                        const hasRequiredFields = row['First Name'] && row['Last Name'] && row['Date of Birth'] && row['Gender'] && (row['Grade'] || row['Grade Level']);
                        if (hasRequiredFields) {
                            students.push({
                                studentId: row['Student ID'] || undefined,
                                firstName: row['First Name'],
                                lastName: row['Last Name'],
                                dateOfBirth: parseDate(row['Date of Birth']),
                                gender: normalizeGender(row['Gender']),
                                gradeLevel: parseInt(row['Grade'] || row['Grade Level']),
                                stream: row['Stream'] || undefined,
                                guardianName: row['Guardian Name'] || undefined,
                                guardianPhone: row['Guardian Phone'] || undefined,
                                guardianEmail: row['Guardian Email'] || undefined,
                                address: row['Address'] || undefined,
                                medicalInfo: row['Medical Info'] || undefined,
                                enrollmentDate: row['Enrollment Date'] ? parseDate(row['Enrollment Date']) : new Date().toISOString().split('T')[0]
                            });
                        }
                    });

                    const validation: ValidationResult = {
                        valid: errors.length === 0,
                        errors,
                        validRows: students.length,
                        totalRows: jsonData.length
                    };

                    resolve({ data: students, validation });
                } catch (error) {
                    reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // ==================== CLASS OPERATIONS ====================

    static exportClassesToExcel(classes: Class[], filename: string = 'classes.xlsx'): void {
        const worksheet = XLSX.utils.json_to_sheet(classes.map(c => ({
            'Class Name': c.className,
            'Grade Level': c.gradeLevel,
            'Stream': c.stream || '',
            'Capacity': c.capacity,
            'Teacher Name': c.teacherName || '',
            'Subjects': Array.isArray(c.subjects) ? c.subjects.join(', ') : c.subjects || '',
            'Room Number': c.roomNumber || '',
            'Schedule': c.schedule || ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Classes');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, filename);
    }

    static async importClassesFromExcel(file: File): Promise<{ data: Class[], validation: ValidationResult }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const classes: Class[] = [];
                    const errors: ValidationError[] = [];

                    jsonData.forEach((row: any, index: number) => {
                        const rowNumber = index + 2;

                        // Validate required fields
                        if (!row['Class Name']) {
                            errors.push({ row: rowNumber, field: 'Class Name', message: 'Class Name is required' });
                        }
                        if (!row['Grade Level']) {
                            errors.push({ row: rowNumber, field: 'Grade Level', message: 'Grade Level is required' });
                        }
                        if (!row['Capacity']) {
                            errors.push({ row: rowNumber, field: 'Capacity', message: 'Capacity is required' });
                        }

                        // Validate data types
                        if (row['Grade Level'] && (row['Grade Level'] < 1 || row['Grade Level'] > 12)) {
                            errors.push({ row: rowNumber, field: 'Grade Level', message: 'Grade Level must be between 1 and 12', value: row['Grade Level'] });
                        }

                        if (row['Capacity'] && (isNaN(row['Capacity']) || row['Capacity'] < 1)) {
                            errors.push({ row: rowNumber, field: 'Capacity', message: 'Capacity must be a positive number', value: row['Capacity'] });
                        }

                        // If no critical errors, add to classes array
                        const hasRequiredFields = row['Class Name'] && row['Grade Level'] && row['Capacity'];
                        if (hasRequiredFields) {
                            classes.push({
                                className: row['Class Name'],
                                gradeLevel: parseInt(row['Grade Level']),
                                stream: row['Stream'] || undefined,
                                capacity: parseInt(row['Capacity']),
                                teacherName: row['Teacher Name'] || undefined,
                                subjects: row['Subjects'] ? row['Subjects'].split(',').map((s: string) => s.trim()) : undefined,
                                roomNumber: row['Room Number'] || undefined,
                                schedule: row['Schedule'] || undefined
                            });
                        }
                    });

                    const validation: ValidationResult = {
                        valid: errors.length === 0,
                        errors,
                        validRows: classes.length,
                        totalRows: jsonData.length
                    };

                    resolve({ data: classes, validation });
                } catch (error) {
                    reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // ==================== GRADING SYSTEM OPERATIONS ====================

    static exportGradingSystemToExcel(gradingSystem: GradingSystem, filename: string = 'grading_system.xlsx'): void {
        const worksheet = XLSX.utils.json_to_sheet(gradingSystem.ranges.map(r => ({
            'Min Score': r.minScore,
            'Max Score': r.maxScore,
            'Letter Grade': r.letterGrade,
            'Grade Point': r.gradePoint || '',
            'Description': r.description || '',
            'Pass/Fail': r.passFail
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Grading System');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, filename);
    }

    static async importGradingSystemFromExcel(file: File): Promise<{ data: GradingSystem, validation: ValidationResult }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const ranges: GradeRange[] = [];
                    const errors: ValidationError[] = [];

                    jsonData.forEach((row: any, index: number) => {
                        const rowNumber = index + 2;

                        // Validate required fields
                        if (row['Min Score'] === undefined || row['Min Score'] === null) {
                            errors.push({ row: rowNumber, field: 'Min Score', message: 'Min Score is required' });
                        }
                        if (row['Max Score'] === undefined || row['Max Score'] === null) {
                            errors.push({ row: rowNumber, field: 'Max Score', message: 'Max Score is required' });
                        }
                        if (!row['Letter Grade']) {
                            errors.push({ row: rowNumber, field: 'Letter Grade', message: 'Letter Grade is required' });
                        }

                        // Validate score ranges
                        const minScore = parseFloat(row['Min Score']);
                        const maxScore = parseFloat(row['Max Score']);

                        if (minScore < 0 || minScore > 100) {
                            errors.push({ row: rowNumber, field: 'Min Score', message: 'Min Score must be between 0 and 100', value: minScore });
                        }
                        if (maxScore < 0 || maxScore > 100) {
                            errors.push({ row: rowNumber, field: 'Max Score', message: 'Max Score must be between 0 and 100', value: maxScore });
                        }
                        if (minScore >= maxScore) {
                            errors.push({ row: rowNumber, field: 'Score Range', message: 'Min Score must be less than Max Score', value: `${minScore}-${maxScore}` });
                        }

                        // If no critical errors, add to ranges array
                        const hasRequiredFields = row['Min Score'] !== undefined && row['Max Score'] !== undefined && row['Letter Grade'];
                        if (hasRequiredFields && minScore < maxScore) {
                            ranges.push({
                                minScore,
                                maxScore,
                                letterGrade: row['Letter Grade'],
                                gradePoint: row['Grade Point'] ? parseFloat(row['Grade Point']) : undefined,
                                description: row['Description'] || undefined,
                                passFail: row['Pass/Fail'] === 'Fail' ? 'Fail' : 'Pass'
                            });
                        }
                    });

                    // Check for overlapping ranges
                    ranges.sort((a, b) => a.minScore - b.minScore);
                    for (let i = 0; i < ranges.length - 1; i++) {
                        if (ranges[i].maxScore > ranges[i + 1].minScore) {
                            errors.push({
                                row: i + 2,
                                field: 'Score Range',
                                message: 'Overlapping score ranges detected',
                                value: `${ranges[i].minScore}-${ranges[i].maxScore} overlaps with ${ranges[i + 1].minScore}-${ranges[i + 1].maxScore}`
                            });
                        }
                    }

                    const validation: ValidationResult = {
                        valid: errors.length === 0,
                        errors,
                        validRows: ranges.length,
                        totalRows: jsonData.length
                    };

                    const gradingSystem: GradingSystem = {
                        name: 'Imported Grading System',
                        ranges
                    };

                    resolve({ data: gradingSystem, validation });
                } catch (error) {
                    reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // ==================== TEMPLATE DOWNLOADS ====================

    static downloadStudentTemplate(): void {
        const template = [
            {
                'Student ID': 'S2024/001',
                'First Name': 'Peter',
                'Last Name': 'Phiri',
                'Date of Birth': '2010-05-15',
                'Gender': 'M',
                'Grade': 7,
                'Stream': 'A',
                'Guardian Name': 'Sarah Phiri',
                'Guardian Phone': '+260 97 1234567',
                'Guardian Email': 'sarah.p@example.com',
                'Address': '123 Kamanga, Lusaka',
                'Medical Info': 'None',
                'Enrollment Date': '2024-01-10'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'student_import_template.xlsx');
    }

    static downloadClassTemplate(): void {
        const template = [
            {
                'Class Name': 'Grade 5A',
                'Grade Level': 5,
                'Stream': 'A',
                'Capacity': 40,
                'Teacher Name': 'Mr. Smith',
                'Subjects': 'Mathematics, English, Science, Social Studies',
                'Room Number': 'R101',
                'Schedule': 'Monday-Friday 08:00-14:00'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Classes Template');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'class_import_template.xlsx');
    }

    static downloadGradingTemplate(): void {
        const template = [
            { 'Min Score': 90, 'Max Score': 100, 'Letter Grade': 'A+', 'Grade Point': 4.0, 'Description': 'Excellent', 'Pass/Fail': 'Pass' },
            { 'Min Score': 80, 'Max Score': 89, 'Letter Grade': 'A', 'Grade Point': 3.7, 'Description': 'Very Good', 'Pass/Fail': 'Pass' },
            { 'Min Score': 70, 'Max Score': 79, 'Letter Grade': 'B', 'Grade Point': 3.0, 'Description': 'Good', 'Pass/Fail': 'Pass' },
            { 'Min Score': 60, 'Max Score': 69, 'Letter Grade': 'C', 'Grade Point': 2.0, 'Description': 'Satisfactory', 'Pass/Fail': 'Pass' },
            { 'Min Score': 50, 'Max Score': 59, 'Letter Grade': 'D', 'Grade Point': 1.0, 'Description': 'Pass', 'Pass/Fail': 'Pass' },
            { 'Min Score': 0, 'Max Score': 49, 'Letter Grade': 'F', 'Grade Point': 0.0, 'Description': 'Fail', 'Pass/Fail': 'Fail' }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Grading Template');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'grading_system_template.xlsx');
    }

    // ==================== TEACHER OPERATIONS ====================

    static async importTeachersFromExcel(file: File): Promise<{ data: Teacher[], validation: ValidationResult }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const teachers: Teacher[] = [];
                    const errors: ValidationError[] = [];

                    jsonData.forEach((row: any, index: number) => {
                        const rowNumber = index + 2;

                        // Validate required fields
                        if (!row['First Name']) errors.push({ row: rowNumber, field: 'First Name', message: 'Required' });
                        if (!row['Last Name']) errors.push({ row: rowNumber, field: 'Last Name', message: 'Required' });
                        if (!row['Email']) errors.push({ row: rowNumber, field: 'Email', message: 'Required' });
                        if (!row['Role']) errors.push({ row: rowNumber, field: 'Role', message: 'Required' });

                        // Validate email format
                        if (row['Email'] && !isValidEmail(row['Email'])) {
                            errors.push({ row: rowNumber, field: 'Email', message: 'Invalid email format', value: row['Email'] });
                        }

                        // Validate Role
                        const validRoles = ['head_teacher', 'deputy_head', 'senior_teacher', 'subject_teacher', 'teacher'];
                        if (row['Role'] && !validRoles.includes(row['Role'].toLowerCase())) {
                            errors.push({ row: rowNumber, field: 'Role', message: 'Invalid role. Use subject_teacher, senior_teacher, etc.', value: row['Role'] });
                        }

                        const hasRequired = row['First Name'] && row['Last Name'] && row['Email'] && row['Role'];

                        if (hasRequired) {
                            teachers.push({
                                firstName: row['First Name'],
                                lastName: row['Last Name'],
                                email: row['Email'],
                                phone: row['Phone'],
                                role: row['Role'].toLowerCase(),
                                tsNumber: row['TS Number'],
                                nrc: row['NRC'],
                                dateOfBirth: parseDate(row['Date of Birth']),
                                gender: normalizeGender(row['Gender']),
                                address: row['Address'],
                                qualifications: row['Qualifications'],
                                joinedDate: row['Joined Date'] ? parseDate(row['Joined Date']) : new Date().toISOString().split('T')[0]
                            });
                        }
                    });

                    const validation: ValidationResult = {
                        valid: errors.length === 0,
                        errors,
                        validRows: teachers.length,
                        totalRows: jsonData.length
                    };

                    resolve({ data: teachers, validation });
                } catch (error) {
                    reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    static downloadTeacherTemplate(): void {
        const template = [
            {
                'First Name': 'John',
                'Last Name': 'Doe',
                'Email': 'john.doe@school.edu.zm',
                'Phone': '+260 97 1234567',
                'Role': 'subject_teacher',
                'TS Number': '123456',
                'NRC': '111111/11/1',
                'Date of Birth': '1985-05-15',
                'Gender': 'M',
                'Address': '123 Independence Ave, Lusaka'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(template);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers Template');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'teacher_import_template.xlsx');
    }

    // ... rest of class methods
}

// Helper functions moved outside class to avoid runtime scope issues
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function normalizeGender(gender: string): 'M' | 'F' {
    if (!gender) return 'M';
    const normalized = gender.toString().toUpperCase();
    if (normalized === 'MALE' || normalized === 'M') return 'M';
    if (normalized === 'FEMALE' || normalized === 'F') return 'F';
    return 'M'; // Default fallback
}

function parseDate(dateValue: any): string {
    if (!dateValue) return '';

    // If it's already in YYYY-MM-DD format
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }

    // If it's a DD/MM/YYYY format
    if (typeof dateValue === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split('/');
        return `${year}-${month}-${day}`;
    }

    // If it's an Excel serial date number
    if (typeof dateValue === 'number') {
        const date = XLSX.SSF.parse_date_code(dateValue);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }

    // Try to parse as Date object
    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        // Ignore parsing errors
    }

    return '';
}


