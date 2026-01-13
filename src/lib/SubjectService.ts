import { supabase } from "./supabaseClient";

export interface Subject {
    id: string;
    school_id?: string;
    name: string;
    code: string;
    category?: 'Core' | 'Elective' | 'Optional';
    description?: string;
    levels?: number[];
}

export class SubjectService {
    static async getSubjects(schoolId?: string): Promise<Subject[]> {
        let query = supabase.from('subjects').select('*');

        if (schoolId) {
            query = query.eq('school_id', schoolId);
        } else {
            // If no schoolId, maybe return national/common subjects (where school_id is null)
            query = query.is('school_id', null);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching subjects:', error);
            return [];
        }
        return data || [];
    }

    static async getAllSubjects(schoolId?: string): Promise<Subject[]> {
        // Fetch both national subjects and school-specific subjects
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .or(`school_id.is.null,school_id.eq.${schoolId}`);

        if (error) {
            console.error('Error fetching all subjects:', error);
            return [];
        }
        return data || [];
    }

    static async saveSubject(subject: Partial<Subject>): Promise<Subject | null> {
        const { data, error } = await supabase
            .from('subjects')
            .upsert(subject)
            .select()
            .single();

        if (error) {
            console.error('Error saving subject:', error);
            throw error;
        }
        return data;
    }

    static async deleteSubject(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting subject:', error);
            return false;
        }
        return true;
    }
}
