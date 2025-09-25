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
}

export type UserRole = 
  // School Level
  | 'head_teacher'
  | 'deputy_head'
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

export class AuthService {
  private static readonly STORAGE_KEY = 'nrs_user';

  static login(email: string, password: string): User | null {
    // Mock authentication - in real app would call API
    const mockUsers: Record<string, User> = {
      'head@school.zm': {
        id: '1',
        email: 'head@school.zm',
        firstName: 'John',
        lastName: 'Mwanza',
        role: 'head_teacher',
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
      }
    };

    const user = mockUsers[email];
    if (user && password === '123456') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      // Dispatch custom event for authentication change
      window.dispatchEvent(new Event('authChange'));
      return user;
    }
    return null;
  }

  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // Dispatch custom event for authentication change
    window.dispatchEvent(new Event('authChange'));
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasPermission(requiredRole: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  }

  static getUserLevel(): 'school' | 'district' | 'provincial' | 'national' | 'student' {
    const user = this.getCurrentUser();
    if (!user) return 'school';

    const schoolRoles = ['head_teacher', 'deputy_head', 'career_guidance_teacher', 'social_welfare_teacher', 'class_teacher', 'house_tutor', 'school_accountant', 'boarding_teacher'];
    const districtRoles = ['district_education_director', 'district_standards_officer', 'district_education_officer', 'district_social_welfare_officer', 'district_planning_officer', 'district_career_officer', 'district_statistical_officer', 'district_accounts_officer'];
    const provincialRoles = ['provincial_education_officer', 'provincial_standards_officer', 'provincial_social_welfare', 'provincial_planning_officer', 'provincial_career_officer', 'provincial_statistical_officer', 'provincial_accounts_officer'];
    const nationalRoles = ['permanent_secretary', 'director_examinations', 'director_curriculum', 'director_planning', 'director_social_welfare', 'director_finance', 'director_special_education'];

    if (user.role === 'student') return 'student';
    if (schoolRoles.includes(user.role)) return 'school';
    if (districtRoles.includes(user.role)) return 'district';
    if (provincialRoles.includes(user.role)) return 'provincial';
    if (nationalRoles.includes(user.role)) return 'national';
    
    return 'school';
  }
}