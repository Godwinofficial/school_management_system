import { supabase } from "./supabaseClient";
import { Student } from "./storage";

export class StudentService {

    // Helper to map DB row to Student object
    private static mapToStudent(row: any): Student {
        // Handle Guardian Mapping (Bridge legacy 'parent_guardian' blob to new 'guardian' object)
        const rawParent = row.parent_guardian;
        let guardian: any = undefined;
        let parentGuardian: any = rawParent || undefined;

        if (rawParent) {
            // Check if it's the new structured format or legacy unified format
            if (rawParent.firstName) {
                guardian = rawParent;
            } else if (rawParent.name) {
                // Convert Legacy/Unified format to Structured Guardian
                const parts = rawParent.name.split(' ');
                guardian = {
                    firstName: parts[0] || '',
                    surname: parts.slice(1).join(' ') || '',
                    contactNumber: rawParent.phoneNumber || '',
                    residentialAddress: rawParent.address || '',
                    email: rawParent.email || '',
                    gender: 'Female', // Default fallback
                    occupation: rawParent.occupation || '',
                    otherNames: '',
                    dateOfBirth: ''
                };
            }
        }

        return {
            id: row.id,
            schoolId: row.school_id,
            classId: row.class_id,
            registrationDate: row.registration_date,
            enrolmentNumber: row.enrolment_number,
            firstName: row.first_name,
            surname: row.surname,
            otherNames: row.other_names,
            nationalId: row.national_id,
            dateOfBirth: row.date_of_birth,
            gender: row.gender,
            residentialAddress: row.residential_address,
            overallPerformance: row.overall_performance || 'Average',
            status: row.status || 'Active',
            currentLevel: row.current_grade || 1,
            email: row.email,

            // Extended fields mapped from columns or JSONB
            placeOfBirth: row.place_of_birth,
            nationality: row.nationality || 'Zambian',
            religion: row.religion,
            previousSchool: row.previous_school,
            transferReason: row.transfer_reason,
            transferDate: row.transfer_date,

            // JSONB fields
            parentGuardian: parentGuardian, // Keep for legacy refs
            guardian: guardian,             // New standard field
            emergencyContact: row.emergency_contact || undefined,
            medicalInfo: row.medical_info || undefined,
            documents: row.documents || [],

            // Status indicators
            isOrphan: !!row.is_orphan,
            hasDisability: !!row.has_disability,
            isMarried: !!row.is_married,

            // Fields that might not map 1:1 or are handled differently
            birthCertificate: row.birth_certificate_url ? {
                name: 'Birth Certificate',
                mime: 'application/pdf',
                data: row.birth_certificate_url
            } : undefined,

            // Joined relations
            school: row.schools || undefined
        } as any as Student;
    }

    static async getStudents(schoolId?: string): Promise<Student[]> {
        let query = supabase.from('students').select('*').order('created_at', { ascending: false });

        if (schoolId) {
            query = query.eq('school_id', schoolId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching students:', error);
            return [];
        }

        return data.map(this.mapToStudent);
    }

    static async getStudent(id: string): Promise<Student | null> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching student:', error);
            return null;
        }

        return this.mapToStudent(data);
    }

    static async saveStudent(student: Student): Promise<Student> {
        // Prioritize the structured 'guardian' object for saving, fallback to 'parentGuardian'
        const guardianPayload = student.guardian || student.parentGuardian;

        // Map Student object to DB row
        const dbPayload: any = {
            id: student.id, // If provided, use it (upsert)
            school_id: student.schoolId,
            class_id: student.classId || null, // Ensure null if undefined during transfer
            registration_date: student.registrationDate || new Date().toISOString(),
            enrolment_number: student.enrolmentNumber,
            first_name: student.firstName,
            surname: student.surname,
            other_names: student.otherNames,
            national_id: student.nationalId,
            date_of_birth: student.dateOfBirth,
            gender: student.gender,
            residential_address: student.residentialAddress,
            overall_performance: student.overallPerformance,
            status: student.status,
            current_grade: student.currentLevel,
            email: student.email,

            place_of_birth: student.placeOfBirth,
            nationality: student.nationality,
            religion: student.religion,
            previous_school: student.previousSchool,
            transfer_reason: student.transferReason,
            transfer_date: student.transferDate,

            // JSONB - Save the best available guardian data into the parent_guardian column
            parent_guardian: guardianPayload,
            emergency_contact: student.emergencyContact,
            medical_info: student.medicalInfo,
            documents: student.documents,

            // Status
            is_orphan: student.isOrphan,
            has_disability: student.hasDisability,
            is_married: student.isMarried
        };

        const { data, error } = await supabase
            .from('students')
            .upsert([dbPayload])
            .select()
            .single();

        if (error) {
            console.error('Error saving student:', error);
            throw error;
        }

        return this.mapToStudent(data);
    }

    static async deleteStudent(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting student:', error);
            return false;
        }
        return true;
    }

    static async bulkCreateStudents(students: Student[], schoolId: string): Promise<number> {
        // Process in batches if necessary
        const payload = students.map(student => ({
            school_id: schoolId,
            class_id: student.classId,
            registration_date: student.registrationDate || new Date().toISOString(),
            enrolment_number: student.enrolmentNumber,
            first_name: student.firstName,
            surname: student.surname,
            other_names: student.otherNames,
            date_of_birth: student.dateOfBirth,
            gender: student.gender,
            status: 'Active',
            parent_guardian: student.parentGuardian,
            overall_performance: 'Average',
            current_grade: student.currentLevel
        }));

        const { error } = await supabase
            .from('students')
            .insert(payload);

        if (error) {
            console.error('Error bulk creating students:', error);
            throw error;
        }

        return students.length;
    }
    static async deleteAllStudents(schoolId: string): Promise<boolean> {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('school_id', schoolId);

        if (error) {
            console.error('Error deleting all students:', error);
            return false;
        }
        return true;
    }

    static async searchNationalPool(query: string): Promise<Student[]> {
        if (!query || query.length < 2) return [];

        // Clean and split query to handle "ID - Name" format
        // We take the first significant part to search broadly, relying on the user to provide a good keyword
        // or we check if any part looks like an ID.
        const terms = query.split(/[\s-]+/).filter(t => t.length > 1);
        const searchTerm = terms[0] || query;

        // Search for students with no associated school (school_id is null) AND status 'Transferred'
        // We include enrolment_number in the search
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .is('school_id', null)
            .eq('status', 'Transferred')
            .or(`first_name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,national_id.ilike.%${searchTerm}%,enrolment_number.ilike.%${searchTerm}%`)
            .limit(20);

        if (error) {
            console.error('Error searching national pool:', error);
            return [];
        }

        return data.map(this.mapToStudent);
    }

    static async findGuardianByPhone(phoneNumber: string): Promise<any | null> {
        // Clean input
        const cleanInput = phoneNumber.replace(/\D/g, '');
        if (cleanInput.length < 5) return null;

        // Search for any student with this guardian phone
        // We fetch students with non-null parent_guardian
        const { data: students, error } = await supabase
            .from('students')
            .select('parent_guardian')
            .not('parent_guardian', 'is', null)
            .limit(100);

        if (error || !students) return null;

        const match = students.find(s => {
            const pg = s.parent_guardian || {};
            const phones = [pg.phoneNumber, pg.contactNumber].filter(Boolean);
            return phones.some(p => {
                const cleanP = String(p).replace(/\D/g, '');
                // 1. Exact match
                if (cleanP === cleanInput) return true;
                // 2. Last 9 digits match
                if (cleanP.length >= 9 && cleanInput.length >= 9) {
                    return cleanP.slice(-9) === cleanInput.slice(-9);
                }
                return false;
            });
        });

        if (match) {
            return match.parent_guardian;
        }

        return null;
    }

    static async getStudentsByGuardianPhone(phoneNumber: string): Promise<Student[]> {
        const cleanInput = phoneNumber.replace(/\D/g, '');
        // Use last 9 digits for broad matching on server side
        const searchDigits = cleanInput.length >= 9 ? cleanInput.slice(-9) : cleanInput;

        // Fetch students with parent_guardian data
        // We use a Left Join on schools (*) so we see students even if they are currently unassigned/transferring
        const { data: students, error } = await supabase
            .from('students')
            .select('*, schools(*)')
            .not('parent_guardian', 'is', null)
            .limit(10000);

        if (error || !students) {
            console.error('Error fetching students by guardian phone:', error);
            return [];
        }

        // Filter in-memory for fuzzy match
        const matches = students.filter(s => {
            const pg = s.parent_guardian || {};
            // Check ALL possible phone keys
            const phones = [pg.phoneNumber, pg.contactNumber, pg.phone, pg.mobile].filter(Boolean);

            return phones.some(p => {
                const cleanP = String(p).replace(/\D/g, '');

                // 1. Exact match
                if (cleanP === cleanInput) return true;

                // 2. Last 9 digits match
                if (cleanP.length >= 9 && cleanInput.length >= 9) {
                    const last9P = cleanP.slice(-9);
                    const last9Input = cleanInput.slice(-9);
                    return last9P === last9Input;
                }
                return false;
            });
        });

        // Map to Student type
        return matches.map(this.mapToStudent);
    }
}
