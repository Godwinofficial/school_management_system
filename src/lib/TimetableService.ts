import { supabase } from "./supabaseClient";

export interface TimetableEntry {
    id: string;
    school_id: string;
    class_id: string;
    teacher_id: string;
    subject_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string;
    color: string;
    modified_by: string;
    created_at?: string;
    updated_at?: string;
    // Joined data
    class_name?: string;
    teacher_name?: string;
    subject_name?: string;
}

export class TimetableService {
    static async getTimetable(schoolId: string, filters?: { classId?: string; teacherId?: string }): Promise<TimetableEntry[]> {
        let query = supabase
            .from('timetables')
            .select(`
                *,
                classes:class_id(name),
                profiles:teacher_id(first_name, last_name),
                subjects:subject_id(name)
            `)
            .eq('school_id', schoolId);

        if (filters?.classId) {
            query = query.eq('class_id', filters.classId);
        }
        if (filters?.teacherId) {
            query = query.eq('teacher_id', filters.teacherId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching timetable:', error);
            throw error;
        }

        return (data || []).map(row => ({
            ...row,
            class_name: row.classes?.name,
            teacher_name: row.profiles ? `${row.profiles.first_name} ${row.profiles.last_name}` : 'Unknown Teacher',
            subject_name: row.subjects?.name
        }));
    }

    static async saveEntry(entry: Partial<TimetableEntry>, userId: string): Promise<TimetableEntry> {
        const payload = {
            ...entry,
            modified_by: userId,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('timetables')
            .upsert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error saving timetable entry:', error);
            throw error;
        }

        // Log the activity
        await this.logActivity(payload.school_id!, userId, entry.id ? 'updated_timetable' : 'created_timetable', `Entry: ${entry.room} - ${entry.start_time}`);

        return data;
    }

    static async deleteEntry(id: string, schoolId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('timetables')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting timetable entry:', error);
            throw error;
        }

        await this.logActivity(schoolId, userId, 'deleted_timetable', `Deleted entry ID: ${id}`);
    }

    private static async logActivity(schoolId: string, userId: string, action: string, details: string) {
        await supabase.from('activity_logs').insert({
            school_id: schoolId,
            user_id: userId,
            action,
            details
        });
    }
}

export class CommunicationService {
    static async getAnnouncements(schoolId: string, audience: string): Promise<any[]> {
        let query = supabase
            .from('announcements')
            .select(`
                *,
                author:author_id(first_name, last_name, role)
            `)
            .eq('school_id', schoolId);

        if (audience !== 'all_admin') {
            query = query.in('audience', ['all', audience]);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching announcements:', error);
            throw error;
        }

        return data;
    }

    static async publishAnnouncement(announcement: any, userId: string): Promise<any> {
        const { data, error } = await supabase
            .from('announcements')
            .insert({
                ...announcement,
                author_id: userId
            })
            .select()
            .single();

        if (error) {
            console.error('Error publishing announcement:', error);
            throw error;
        }

        return data;
    }

    static async getMessages(schoolId: string, userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(first_name, last_name, role),
                recipient:recipient_id(first_name, last_name, role)
            `)
            .eq('school_id', schoolId)
            .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }

        return data;
    }

    static async sendMessage(message: any, userId: string): Promise<any> {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                ...message,
                sender_id: userId
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            throw error;
        }

        return data;
    }

    static async updateMessage(id: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ content })
            .eq('id', id);

        if (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }

    static async deleteMessage(id: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    static async deleteConversation(userId: string, otherId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .delete()
            .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`);

        if (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }
}
