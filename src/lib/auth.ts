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
  };
  district?: string;
  province?: string;
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
  head_teacher: ['manage_staff', 'manage_students', 'manage_classes', 'manage_assessments', 'view_reports', 'manage_settings', 'manage_finance'],
  deputy_head: ['manage_staff', 'manage_students', 'manage_classes', 'manage_assessments', 'view_reports'],
  senior_teacher: ['manage_students', 'manage_classes', 'manage_assessments', 'view_reports'],
  class_teacher: ['manage_students', 'manage_assessments', 'view_reports'],
  // Add others as empty defaults for now
  career_guidance_teacher: [],
  social_welfare_teacher: [],
  house_tutor: [],
  school_accountant: ['manage_finance'],
  boarding_teacher: [],
  district_education_director: [],
  district_standards_officer: [],
  district_education_officer: [],
  district_social_welfare_officer: [],
  district_planning_officer: [],
  district_career_officer: [],
  district_statistical_officer: [],
  district_accounts_officer: [],
  provincial_education_officer: [],
  provincial_standards_officer: [],
  provincial_social_welfare: [],
  provincial_planning_officer: [],
  provincial_career_officer: [],
  provincial_statistical_officer: [],
  provincial_accounts_officer: [],
  super_admin: [],
  permanent_secretary: [],
  director_examinations: [],
  director_curriculum: [],
  director_planning: [],
  director_social_welfare: [],
  director_finance: [],
  director_special_education: [],
  student: []
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
          centerNumber: 'LPS001'
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
          centerNumber: 'LPS001'
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
          centerNumber: 'LPS001'
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
          centerNumber: 'LPS001'
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
          centerNumber: 'LPS001'
        }
      }
    };

    const storedUsersJson = localStorage.getItem(this.USERS_KEY);
    if (storedUsersJson) {
      const storedUsers = JSON.parse(storedUsersJson);
      let updated = false;

      // Ensure all initial users exist in stored data
      Object.keys(initialUsers).forEach(key => {
        if (!storedUsers[key]) {
          storedUsers[key] = initialUsers[key];
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

  static login(email: string, password: string): User | null {
    const users = this.getMockUsers();
    const user = users[email];

    // In a real app, we would check hashed passwords. 
    // For this mock, we accept '123456' or 'password123' (for auto-generated accounts)
    if (user && (password === '123456' || password === 'password123')) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('authChange'));
      return user;
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
    return userData ? JSON.parse(userData) : null;
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new Event('authChange'));
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