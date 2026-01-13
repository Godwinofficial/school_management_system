export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  school?: {
    id: string;
    name: string;
    type: 'Grant Aided' | 'GRZ' | 'Private';
    province: string;
    district: string;
    ward: string;
    standardCapacity: number;
    totalEnrolment: number;
    centerNumber: string;
    slug: string;
  };
  district?: string;
  province?: string;
  classId?: string;
  metadata?: any;
  permissions?: UserPermission[];
}


export type UserRole =
  // School Level
  | 'head_teacher'
  | 'deputy_head'
  | 'senior_teacher'
  | 'career_guidance_teacher'
  | 'social_welfare_teacher'
  | 'class_teacher'
  | 'house_tutor'
  | 'school_accountant'
  | 'boarding_teacher'
  // District Level
  | 'district_education_director'
  | 'district_standards_officer'
  | 'district_education_officer'
  | 'district_social_welfare_officer'
  | 'district_planning_officer'
  | 'district_career_officer'
  | 'district_statistical_officer'
  | 'district_accounts_officer'
  // Provincial Level
  | 'provincial_education_officer'
  | 'provincial_standards_officer'
  | 'provincial_social_welfare'
  | 'provincial_planning_officer'
  | 'provincial_career_officer'
  | 'provincial_statistical_officer'
  | 'provincial_accounts_officer'
  // System Level
  | 'super_admin'
  // National Level
  | 'permanent_secretary'
  | 'director_examinations'
  | 'director_curriculum'
  | 'director_planning'
  | 'director_social_welfare'
  | 'director_finance'
  | 'director_special_education'
  // Student
  | 'student';

export type UserPermission =
  | 'manage_staff'
  | 'manage_students'
  | 'manage_classes'
  | 'manage_assessments'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_finance';

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermission[]> = {
  // Head Teacher - Super User of the School
  head_teacher: [
    'manage_staff',
    'manage_students',
    'manage_classes',
    'manage_assessments',
    'view_reports',
    'manage_settings',
    'manage_finance'
  ],

  // Deputy Head - Nearly full access, but typically limited in top-level finance/settings changes unless delegated
  deputy_head: [
    'manage_staff',
    'manage_students',
    'manage_classes',
    'manage_assessments',
    'view_reports'
  ],

  // Senior Teacher - Academic Focus
  senior_teacher: [
    'manage_students',
    'manage_classes',
    'manage_assessments',
    'view_reports'
  ],

  // Class Teacher - Student & Assessment Focus
  class_teacher: [
    'manage_students', // Implicitly their own students usually
    'manage_assessments',
    'view_reports'
  ],

  // Specialized Roles (Limited Access)
  career_guidance_teacher: ['view_reports'], // Need to view student performance to guide
  social_welfare_teacher: ['view_reports'],  // Need to view student backgrounds/issues
  school_accountant: ['manage_finance', 'view_reports'], // Finance focus
  house_tutor: ['manage_students'], // Manage boarding students potentially
  boarding_teacher: ['manage_students'],

  // District Level
  district_education_director: ['view_reports'],
  district_standards_officer: ['view_reports'],
  district_education_officer: ['view_reports'],
  district_social_welfare_officer: ['view_reports'],
  district_planning_officer: ['view_reports'],
  district_career_officer: ['view_reports'],
  district_statistical_officer: ['view_reports'],
  district_accounts_officer: ['view_reports'],

  // Provincial Level
  provincial_education_officer: ['view_reports'],
  provincial_standards_officer: ['view_reports'],
  provincial_social_welfare: ['view_reports'],
  provincial_planning_officer: ['view_reports'],
  provincial_career_officer: ['view_reports'],
  provincial_statistical_officer: ['view_reports'],
  provincial_accounts_officer: ['view_reports'],

  // System Level
  super_admin: [
    'manage_staff', 'manage_students', 'manage_classes',
    'manage_assessments', 'view_reports', 'manage_settings', 'manage_finance'
  ],

  // National Level
  permanent_secretary: ['view_reports'],
  director_examinations: ['view_reports'],
  director_curriculum: ['view_reports'],
  director_planning: ['view_reports'],
  director_social_welfare: ['view_reports'],
  director_finance: ['view_reports'],
  director_special_education: ['view_reports'],

  // Student
  student: ['view_reports'] // Can view their own reports
};

export class AuthService {
  private static readonly STORAGE_KEY = 'nrs_user';
  private static readonly USERS_KEY = 'nrs_users_db';

  private static getMockUsers(): Record<string, User> {
    // Initial mock users
    const initialUsers: Record<string, User> = {
      'head@school.zm': {
        id: '1',
        email: 'head@school.zm',
        firstName: 'John',
        lastName: 'Mwanza',
        role: 'head_teacher',
        permissions: DEFAULT_PERMISSIONS.head_teacher,
        school: {
          id: 'school_1',
          name: 'Lusaka Primary School',
          type: 'GRZ',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 1',
          standardCapacity: 500,
          totalEnrolment: 480,
          centerNumber: 'LPS001',
          slug: 'lusaka-primary-school-lps001'
        }
      },
      'teacher@school.zm': {
        id: '4',
        email: 'teacher@school.zm',
        firstName: 'Sarah',
        lastName: 'Kabwe',
        role: 'class_teacher',
        permissions: DEFAULT_PERMISSIONS.class_teacher,
        school: {
          id: 'school_1',
          name: 'Lusaka Primary School',
          type: 'GRZ',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 1',
          standardCapacity: 500,
          totalEnrolment: 480,
          centerNumber: 'LPS001',
          slug: 'lusaka-primary-school-lps001'
        }
      },
      'district@education.zm': {
        id: '2',
        email: 'district@education.zm',
        firstName: 'Mary',
        lastName: 'Banda',
        role: 'district_education_director',
        district: 'Lusaka',
        province: 'Lusaka'
      },
      'provincial@education.zm': {
        id: 'prov_1',
        email: 'provincial@education.zm',
        firstName: 'Paul',
        lastName: 'Zuma',
        role: 'provincial_education_officer',
        province: 'Lusaka'
      },
      'student@school.zm': {
        id: '3',
        email: 'student@school.zm',
        firstName: 'Peter',
        lastName: 'Ng\'andu',
        role: 'student',
        school: {
          id: 'school_1',
          name: 'Lusaka Primary School',
          type: 'GRZ',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 1',
          standardCapacity: 500,
          totalEnrolment: 480,
          centerNumber: 'LPS001',
          slug: 'lusaka-primary-school-lps001'
        }
      },
      'admin@system.zm': {
        id: '5',
        email: 'admin@system.zm',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin'
      },
      'deputy@school.zm': {
        id: '6',
        email: 'deputy@school.zm',
        firstName: 'James',
        lastName: 'Phiri',
        role: 'deputy_head',
        permissions: DEFAULT_PERMISSIONS.deputy_head,
        school: {
          id: 'school_1',
          name: 'Lusaka Primary School',
          type: 'GRZ',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 1',
          standardCapacity: 500,
          totalEnrolment: 480,
          centerNumber: 'LPS001',
          slug: 'lusaka-primary-school-lps001'
        }
      },
      'senior@school.zm': {
        id: '7',
        email: 'senior@school.zm',
        firstName: 'Alice',
        lastName: 'Bwalya',
        role: 'senior_teacher',
        permissions: DEFAULT_PERMISSIONS.senior_teacher,
        school: {
          id: 'school_1',
          name: 'Lusaka Primary School',
          type: 'GRZ',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 1',
          standardCapacity: 500,
          totalEnrolment: 480,
          centerNumber: 'LPS001',
          slug: 'lusaka-primary-school-lps001'
        }
      }
    };

    const storedUsersJson = localStorage.getItem(this.USERS_KEY);
    if (storedUsersJson) {
      const storedUsers = JSON.parse(storedUsersJson);
      let updated = false;

      // Ensure all initial users exist in stored data AND are up to date
      Object.keys(initialUsers).forEach(key => {
        const stored = storedUsers[key];
        const initial = initialUsers[key];

        // Check if missing or if school exists but slug is missing (stale data)
        const isStale = stored && stored.school && !stored.school.slug;

        if (!stored || isStale) {
          storedUsers[key] = initial;
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(storedUsers));
      }

      return storedUsers;
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }

  static async login(identifier: string, password: string): Promise<User | null> {
    const users = this.getMockUsers();

    // 1. Try Mock Users (Admins/Teachers) - Identifier is Email
    const dbUsers = this.getMockUsers();
    let user = dbUsers[identifier];

    if (user && (password === '123456' || password === 'password123')) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('authChange'));
      return user;
    }

    // 2. Try Supabase Profiles (For Auto-Generated Users)
    try {
      const { supabase } = await import('./supabaseClient');
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
                *,
                school:schools(id, name, type, province, district, ward, center_number, slug, standard_capacity, total_enrolment)
            `)
        .eq('email', identifier)
        .maybeSingle();

      if (profile) {
        // Default Password Check for Demo/Dev: '123456'
        if (password === '123456') {
          const userObj: User = {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            role: profile.role as UserRole,
            permissions: profile.metadata?.permissions || [],
            school: profile.school ? {
              id: profile.school.id,
              name: profile.school.name,
              type: profile.school.type,
              province: profile.school.province,
              district: profile.school.district,
              ward: profile.school.ward || '',
              centerNumber: profile.school.center_number,
              slug: profile.school.slug || profile.school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              standardCapacity: profile.school.standard_capacity || 500,
              totalEnrolment: profile.school.total_enrolment || 0
            } : undefined
          };

          // Cache this user locally to make subsequent lookups faster/work with sync logic
          this.registerUser(userObj);

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userObj));
          window.dispatchEvent(new Event('authChange'));
          return userObj;
        }
      }
    } catch (err) {
      console.error("Supabase login check failed", err);
    }

    // 2. Try Student Login (Identifier is Enrolment Number OR National ID)
    // Check if identifier looks like enrolment number (contains '/') OR is numeric (National ID)
    // We will just try to find a student with this identifier in either field
    if (true) { // Always try if not found in mock users
      try {
        // Import dynamically or assume Supabase is available
        const { supabase } = await import('./supabaseClient');

        // Try by Enrolment Number first
        let { data: student, error } = await supabase
          .from('students')
          .select('*, schools!inner(*)')
          .eq('enrolment_number', identifier)
          .maybeSingle();

        // If not found, try National ID
        if (!student || error) {
          const result = await supabase
            .from('students')
            .select('*, schools!inner(*)')
            .eq('national_id', identifier) // Check national_id
            .maybeSingle();

          student = result.data;
          error = result.error;
        }

        if (student && !error) {
          // DEFAULT PASSWORD CHECK: password === identifier (either enrolment or national ID)
          // In a real app we'd have a password_hash column or a separate auth table
          // For simplified flow: Password must match the Identifier used OR the Enrolment Number

          const validPass = (password === identifier) || (password === student.enrolment_number) || (password === student.national_id);

          if (validPass) {

            const studentUser: User = {
              id: student.id,
              email: student.email || `${student.enrolment_number}@student.place`,
              firstName: student.first_name,
              lastName: student.surname,
              role: 'student',
              school: {
                id: student.schools.id,
                name: student.schools.name,
                type: student.schools.type,
                province: student.schools.province,
                district: student.schools.district,
                ward: student.schools.ward,
                standardCapacity: student.schools.standard_capacity,
                totalEnrolment: student.schools.total_enrolment,
                centerNumber: student.schools.center_number,
                slug: student.schools.slug || student.schools.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              },
              permissions: DEFAULT_PERMISSIONS.student
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(studentUser));
            window.dispatchEvent(new Event('authChange'));
            return studentUser;
          }
        }
      } catch (err) {
        console.error("Student login error:", err);
      }
    }

    return null;
  }

  static registerUser(user: User): void {
    const users = this.getMockUsers();
    users[user.email] = user;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static updateUser(email: string, updates: Partial<User>): User | null {
    const users = this.getMockUsers();
    const user = users[email];
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    users[email] = updatedUser;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // If updating current user, update session storage too
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email === email) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('authChange'));
    }

    return updatedUser;
  }

  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.STORAGE_KEY);
    if (!userData) return null;

    const user = JSON.parse(userData);

    // Auto-patch session if school slug is missing OR if it accidentally matches the user's name slug (common data corruption issue)
    // We detect "bad slugs" by checking if it looks like a person's name slug but should be a school slug
    // We detect "bad slugs" by checking if it looks like a person's name slug but should be a school slug
    const nameSlug = user.firstName && user.lastName ? `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}` : '';
    // Only patch if slug is missing OR exactly matches the user's name slug (not just includes it)
    const isBadSlug = user.school && (!user.school.slug || (nameSlug && user.school.slug === nameSlug));

    if (isBadSlug) {
      // Regenerate slug from school name, which is more reliable
      const schoolNameSlug = user.school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const centerSlug = user.school.centerNumber ? `-${user.school.centerNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
      user.school.slug = `${schoolNameSlug}${centerSlug}`;
      // Update storage to persist the fix
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }

    return user;
  }

  static logout(): void {
    // Get the current user before clearing session to extract school slug
    const user = this.getCurrentUser();

    // Clear the session
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new Event('authChange'));

    // Redirect to appropriate login page based on user's school
    if (user?.school?.slug) {
      // School-based users (teachers, students, etc.) - redirect to their school's login
      window.location.href = `/login?school=${user.school.slug}`;
    } else if (user?.role === 'super_admin') {
      // Super admin - redirect to generic login
      window.location.href = '/login';
    } else {
      // Other users (district, provincial, national) - redirect to generic login
      window.location.href = '/login';
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(requiredRole: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  }

  static hasPermission(permission: UserPermission | UserPermission[]): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) return false;

    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.some(p => user.permissions?.includes(p));
  }

  static getUserLevel(): 'school' | 'district' | 'provincial' | 'national' | 'student' | 'system' {
    const user = this.getCurrentUser();
    if (!user) return 'school';

    const schoolRoles = ['head_teacher', 'deputy_head', 'senior_teacher', 'career_guidance_teacher', 'social_welfare_teacher', 'class_teacher', 'house_tutor', 'school_accountant', 'boarding_teacher'];
    const districtRoles = ['district_education_director', 'district_standards_officer', 'district_education_officer', 'district_social_welfare_officer', 'district_planning_officer', 'district_career_officer', 'district_statistical_officer', 'district_accounts_officer'];
    const provincialRoles = ['provincial_education_officer', 'provincial_standards_officer', 'provincial_social_welfare', 'provincial_planning_officer', 'provincial_career_officer', 'provincial_statistical_officer', 'provincial_accounts_officer'];
    const nationalRoles = ['permanent_secretary', 'director_examinations', 'director_curriculum', 'director_planning', 'director_social_welfare', 'director_finance', 'director_special_education'];

    if (user.role === 'super_admin') return 'system';
    if (user.role === 'student') return 'student';
    if (schoolRoles.includes(user.role)) return 'school';
    if (districtRoles.includes(user.role)) return 'district';
    if (provincialRoles.includes(user.role)) return 'provincial';
    if (nationalRoles.includes(user.role)) return 'national';

    return 'school';
  }

  static getUsersBySchool(schoolId: string): User[] {
    const users = this.getMockUsers();
    return Object.values(users).filter(user => user.school?.id === schoolId);
  }
}