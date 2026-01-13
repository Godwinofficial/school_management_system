import { supabase } from "./supabaseClient";
import { Student } from "./storage";

export class StudentService {

    // Helper to map DB row to Student object
    private static mapToStudent(row: any): Student {
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

            // JSONB fields
            parentGuardian: row.parent_guardian || undefined,
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
                mime: 'application/pdf', // simplified
                data: row.birth_certificate_url
            } : undefined
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
        // Map Student object to DB row
        const dbPayload: any = {
            id: student.id, // If provided, use it (upsert)
            school_id: student.schoolId,
            class_id: student.classId || null, // Ensure null if undefined during transfer
            registration_date: student.registrationDate,
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

            // JSONB
            parent_guardian: student.parentGuardian,
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
}
