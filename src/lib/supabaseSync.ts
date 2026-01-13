import { SupabaseService } from './SupabaseService';

// Keys used by StorageService
const SCHOOLS_KEY = 'nrs_schools';
const TEACHERS_KEY = 'nrs_teachers';
const CLASSES_KEY = 'nrs_classes';
const STUDENTS_KEY = 'nrs_students';
const SUBJECTS_KEY = 'nrs_subjects';

export async function syncFromSupabaseToLocal() {
  // Only run if VITE_SUPABASE_URL is provided
  if (!import.meta.env.VITE_SUPABASE_URL) return;

  try {
    const [schoolsRes, teachersRes, classesRes, studentsRes, subjectsRes] = await Promise.all([
      SupabaseService.getSchools(),
      SupabaseService.getTeachers(),
      SupabaseService.getClasses(),
      SupabaseService.getStudents(),
      SupabaseService.getSubjects()
    ]);

    if (!schoolsRes.error && schoolsRes.data) {
      localStorage.setItem(SCHOOLS_KEY, JSON.stringify(schoolsRes.data));
    }
    if (!teachersRes.error && teachersRes.data) {
      localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachersRes.data));
    }
    if (!classesRes.error && classesRes.data) {
      localStorage.setItem(CLASSES_KEY, JSON.stringify(classesRes.data));
    }
    if (!studentsRes.error && studentsRes.data) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentsRes.data));
    }
    if (!subjectsRes.error && subjectsRes.data) {
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjectsRes.data));
    }

    // Note: this approach loads Supabase data into localStorage so the existing app code that uses
    // StorageService (which reads localStorage synchronously) continues to work.

    return { ok: true };
  } catch (err) {
    console.error('Supabase sync failed', err);
    return { ok: false, error: err };
  }
}
