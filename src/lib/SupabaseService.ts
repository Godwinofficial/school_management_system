import { supabase } from './supabaseClient';

export interface SchoolInput {
  id: string; // unique id (use centerNumber or provided id)
  name: string;
  province: string;
  district: string;
  ward?: string;
  type?: 'Grant Aided' | 'GRZ' | 'Private';
  standardCapacity?: number;
  totalEnrolment?: number;
  centerNumber?: string;
}

export interface ProfileSeed {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  school_id?: string;
  province?: string;
  district?: string;
  department?: string;
}

export interface TeacherData {
  id: string;
  assignedClass: string;
  subjects: string[];
  todaysSchedule: Array<{
    time: string;
    subject: string;
    class: string;
    type: string;
    topic?: string;
  }>;
}

export interface ClassData {
  id: string;
  name: string;
  totalStudents: number;
  genderStats: {
    male: number;
    female: number;
  };
  studentsNeedingAttention: Array<{
    id: string;
    name: string;
    subject: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
  topic: string;
  totalMarks: number;
  type: string;
}

export interface Assessment {
  id: string;
  classId: string;
  subject: string;
  title: string;
  dueDate: string;
  totalSubmissions: number;
  pendingGrading: number;
  type: string;
}

export class SupabaseService {
  // Auth
  static async signIn(email: string, password: string) {
    const res = await supabase.auth.signInWithPassword({ email, password });
    return res;
  }

  static async signOut() {
    return supabase.auth.signOut();
  }

  static async getSession() {
    return supabase.auth.getSession();
  }

  // Create school and seed profile rows (NOT auth user creation).
  // Note: Creating real auth users require the service_role key and should be done from a secure server/Edge Function.
  static async createSchoolWithProfiles(school: SchoolInput, generateProfiles = true) {
    // Insert school row
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .insert([school])
      .select('*')
      .single();

    if (schoolError) {
      return { error: schoolError };
    }

    let profiles: any[] = [];

    if (generateProfiles) {
      // Generate reasonable demo profiles for head and deputy
      const headEmail = `head@${school.centerNumber || school.id}.zm`;
      const deputyEmail = `deputy@${school.centerNumber || school.id}.zm`;

      const seeds: ProfileSeed[] = [
        {
          email: headEmail,
          first_name: 'Head',
          last_name: school.name.split(' ')[0] || 'Teacher',
          role: 'head_teacher',
          school_id: schoolData.id,
          province: school.province,
          district: school.district
        },
        {
          email: deputyEmail,
          first_name: 'Deputy',
          last_name: school.name.split(' ')[0] || 'Deputy',
          role: 'deputy_head',
          school_id: schoolData.id,
          province: school.province,
          district: school.district
        }
      ];

      // Insert into a `profiles` table (this is separate from auth.users).
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert(seeds)
        .select('*');

      if (profileError) {
        return { school: schoolData, error: profileError };
      }

      profiles = profileData || [];

      // Attempt to call admin endpoint to create real auth users if available
      try {
        const adminEndpoint = import.meta.env.VITE_ADMIN_CREATE_USER_URL as string | undefined;
        if (adminEndpoint) {
          // call endpoint for each profile to create an auth user and get back user id
          for (const p of seeds) {
            await fetch(adminEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: p.email, password: '123456', role: p.role, metadata: { school_id: p.school_id } })
            });
          }
        }
      } catch (err) {
        // ignore admin endpoint failures - profiles still created in DB
      }

      /*
        Important: To create actual Supabase Auth users (so they can sign in with email/password),
        you must call the Admin API using the service role key which must never be used in the browser.
        Recommended approach:
        1) Create an Edge Function or small secure server endpoint that uses the service_role key.
        2) That endpoint creates auth users via the Admin API and sets initial passwords.
        3) Optionally send initial password emails or force password reset on first login.
      */
    }

    return { school: schoolData, profiles };
  }

  // Convenience wrappers for CRUD - example: getSchools
  static async getSchools() {
    const { data, error } = await supabase.from('schools').select('*');
    return { data, error };
  }

  static async getStudents(schoolId?: string) {
    let q = supabase.from('students').select('*');
    if (schoolId) q = q.eq('school_id', schoolId as any);
    const { data, error } = await q;
    return { data, error };
  }

  static async getTeachers(schoolId?: string) {
    let q = supabase.from('teachers').select('*');
    if (schoolId) q = q.eq('school_id', schoolId as any);
    const { data, error } = await q;
    return { data, error };
  }

  static async getClasses(schoolId?: string) {
    let q = supabase.from('classes').select('*');
    if (schoolId) q = q.eq('school_id', schoolId as any);
    const { data, error } = await q;
    return { data, error };
  }

  static async getSubjects() {
    const { data, error } = await supabase.from('subjects').select('*');
    return { data, error };
  }

  // Teacher Dashboard Methods
  static async getTeacherProfile(userId: string) {
    // First try to find in teachers table directly linked to auth user (if possible)
    // Or mostly likely, we link via email for now as per current schema

    // For this implementation, we'll try to find a teacher record where email matches
    // In a real production app, you'd have a user_id column in teachers table.

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, school_id')
      .eq('id', userId)
      .single();

    if (!profile) return null;

    const { data: teacher } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', profile.email)
      .single();

    return teacher;
  }

  static async getTeacherSchedule(teacherId: string) {
    // Get today's day of week (1=Monday, etc)
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Adjust if your DB uses 1-7 (Mon-Sun) or similar. Assuming 1=Mon.

    const { data, error } = await supabase
      .from('timetables')
      .select(`
        *,
        class:classes(name),
        subject:subjects(name) -- or just use subject_id if it is text name
      `)
      .eq('teacher_id', teacherId) // This assumes timetables uses teacher UUID
      .eq('day_of_week', adjustedDay)
      .order('start_time', { ascending: true });

    return { data, error };
  }

  static async getClassStats(classId: string): Promise<ClassData | null> {
    // 1. Get class details
    const { data: classDetails } = await supabase
      .from('classes')
      .select('name')
      .eq('id', classId)
      .single();

    if (!classDetails) return null;

    // 2. Get students
    const { data: students } = await supabase
      .from('students')
      .select('gender')
      .eq('class_id', classId);

    const totalStudents = students?.length || 0;
    const male = students?.filter(s => s.gender === 'Male').length || 0;
    const female = students?.filter(s => s.gender === 'Female').length || 0;

    // 3. Mock "Needs Attention" for now (or could be a real table)
    // In future: fetch from an 'academic_alerts' table
    const studentsNeedingAttention = [];

    return {
      id: classId,
      name: classDetails.name,
      totalStudents,
      genderStats: { male, female },
      studentsNeedingAttention
    };
  }

  static async getUpcomingExams(schoolId: string, teacherId?: string): Promise<Exam[]> {
    let query = supabase
      .from('exams')
      .select('*')
      .eq('school_id', schoolId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(5);

    // If we want to filter by teacher's subjects, we'd need that logic. 
    // For now, return school exams or filter logic in UI

    const { data } = await query;
    return (data as any[])?.map(e => ({
      id: e.id,
      subject: e.subject,
      date: e.date,
      topic: e.topic,
      totalMarks: e.total_marks,
      type: e.type
    })) || [];
  }

  static async getPendingAssessments(teacherId: string): Promise<Assessment[]> {
    const { data } = await supabase
      .from('assessments')
      .select('*')
      .eq('teacher_id', teacherId)
      .gt('due_date', new Date().toISOString())
      .limit(5);

    return (data as any[])?.map(a => ({
      id: a.id,
      classId: a.class_id,
      subject: a.subject,
      title: a.title,
      dueDate: a.due_date,
      totalSubmissions: a.total_submissions,
      pendingGrading: a.pending_grading,
      type: a.type
    })) || [];
  }
}
