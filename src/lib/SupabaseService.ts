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
}
