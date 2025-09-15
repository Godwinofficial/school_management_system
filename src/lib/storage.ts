// Mock data storage using localStorage for the school management system

export interface School {
  id: string;
  province: string;
  district: string;
  ward: string;
  name: string;
  type: 'Grant Aided' | 'GRZ' | 'Private';
  standardCapacity: number;
  totalEnrolment: number;
  centerNumber: string;
}

export interface Student {
  id: string;
  schoolId: string;
  // Registration
  registrationDate: string;
  enrolmentNumber: string;
  
  // Biographical
  firstName: string;
  surname: string;
  otherNames?: string;
  nationalId?: string;
  examinationNumber?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  residentialAddress: string;
  
  // Family Information
  father?: {
    firstName: string;
    surname: string;
    otherNames?: string;
    contactNumber?: string;
    residentialAddress?: string;
    nationality: string;
    nationalId?: string;
    dateOfBirth?: string;
    isDeceased: boolean;
  };
  
  mother?: {
    firstName: string;
    surname: string;
    otherNames?: string;
    contactNumber?: string;
    residentialAddress?: string;
    nationality: string;
    nationalId?: string;
    dateOfBirth?: string;
    isDeceased: boolean;
  };
  
  // Guardian Information
  guardian?: {
    firstName: string;
    surname: string;
    otherNames?: string;
    gender: 'Male' | 'Female';
    residentialAddress: string;
    occupation: string;
    dateOfBirth: string;
    contactNumber: string;
  };
  
  // Academic Information
  currentLevel: number; // 1-12
  healthStatus: 'Good' | 'Fair' | 'Poor' | 'Special Needs';
  academicPerformance: {
    [level: number]: {
      A: number;
      B: number;
      C: number;
    };
  };
  overallPerformance: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  careerPathways: string[];
  specialInformation?: string;
  
  // Status
  status: 'Active' | 'Transferred' | 'Dropped Out' | 'Graduated' | 'Deceased';
  isOrphan: boolean;
  hasDisability: boolean;
  isMarried: boolean;
}

export class StorageService {
  private static readonly SCHOOLS_KEY = 'nrs_schools';
  private static readonly STUDENTS_KEY = 'nrs_students';

  // Initialize with sample data
  static initializeSampleData(): void {
    if (!localStorage.getItem(this.SCHOOLS_KEY)) {
      const sampleSchools: School[] = [
        {
          id: 'school_1',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 1',
          name: 'Lusaka Primary School',
          type: 'GRZ',
          standardCapacity: 500,
          totalEnrolment: 480,
          centerNumber: 'LPS001'
        },
        {
          id: 'school_2',
          province: 'Lusaka',
          district: 'Lusaka',
          ward: 'Ward 2',
          name: 'Chilenje Secondary School',
          type: 'Grant Aided',
          standardCapacity: 800,
          totalEnrolment: 750,
          centerNumber: 'CSS002'
        }
      ];
      localStorage.setItem(this.SCHOOLS_KEY, JSON.stringify(sampleSchools));
    }

    if (!localStorage.getItem(this.STUDENTS_KEY)) {
      const sampleStudents: Student[] = [
        {
          id: 'student_1',
          schoolId: 'school_1',
          registrationDate: '2024-01-15',
          enrolmentNumber: 'LPS001/2024/001',
          firstName: 'Peter',
          surname: 'Ng\'andu',
          otherNames: 'James',
          nationalId: '123456/78/9',
          dateOfBirth: '2010-05-15',
          gender: 'Male',
          residentialAddress: '123 Kamanga Street, Lusaka',
          currentLevel: 7,
          healthStatus: 'Good',
          academicPerformance: {
            6: { A: 3, B: 4, C: 2 },
            7: { A: 2, B: 5, C: 2 }
          },
          overallPerformance: 'Good',
          careerPathways: ['Engineering', 'Mathematics'],
          status: 'Active',
          isOrphan: false,
          hasDisability: false,
          isMarried: false,
          father: {
            firstName: 'John',
            surname: 'Ng\'andu',
            contactNumber: '+260977123456',
            nationality: 'Zambian',
            nationalId: '123456/78/1',
            isDeceased: false
          },
          mother: {
            firstName: 'Mary',
            surname: 'Ng\'andu',
            contactNumber: '+260966123456',
            nationality: 'Zambian',
            nationalId: '123456/78/2',
            isDeceased: false
          }
        }
      ];
      localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(sampleStudents));
    }
  }

  // Schools
  static getSchools(): School[] {
    const data = localStorage.getItem(this.SCHOOLS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getSchool(id: string): School | null {
    const schools = this.getSchools();
    return schools.find(school => school.id === id) || null;
  }

  static saveSchool(school: School): void {
    const schools = this.getSchools();
    const index = schools.findIndex(s => s.id === school.id);
    if (index >= 0) {
      schools[index] = school;
    } else {
      schools.push(school);
    }
    localStorage.setItem(this.SCHOOLS_KEY, JSON.stringify(schools));
  }

  // Students
  static getStudents(schoolId?: string): Student[] {
    const data = localStorage.getItem(this.STUDENTS_KEY);
    const students = data ? JSON.parse(data) : [];
    return schoolId ? students.filter((s: Student) => s.schoolId === schoolId) : students;
  }

  static getStudent(id: string): Student | null {
    const students = this.getStudents();
    return students.find(student => student.id === id) || null;
  }

  static saveStudent(student: Student): void {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));
  }

  static deleteStudent(id: string): void {
    const students = this.getStudents();
    const filtered = students.filter(s => s.id !== id);
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(filtered));
  }

  // Statistics
  static getStatistics(level: 'school' | 'district' | 'provincial' | 'national' | 'student', contextId?: string) {
    const students = this.getStudents();
    const schools = this.getSchools();
    
    let filteredStudents = students;
    let filteredSchools = schools;
    
    if (level === 'school' && contextId) {
      filteredStudents = students.filter(s => s.schoolId === contextId);
      filteredSchools = schools.filter(s => s.id === contextId);
    }
    
    return {
      totalStudents: filteredStudents.length,
      totalSchools: filteredSchools.length,
      genderStats: {
        male: filteredStudents.filter(s => s.gender === 'Male').length,
        female: filteredStudents.filter(s => s.gender === 'Female').length
      },
      statusStats: {
        active: filteredStudents.filter(s => s.status === 'Active').length,
        transferred: filteredStudents.filter(s => s.status === 'Transferred').length,
        droppedOut: filteredStudents.filter(s => s.status === 'Dropped Out').length,
        graduated: filteredStudents.filter(s => s.status === 'Graduated').length
      },
      specialStats: {
        orphans: filteredStudents.filter(s => s.isOrphan).length,
        withDisability: filteredStudents.filter(s => s.hasDisability).length,
        married: filteredStudents.filter(s => s.isMarried).length
      },
      performanceStats: {
        excellent: filteredStudents.filter(s => s.overallPerformance === 'Excellent').length,
        good: filteredStudents.filter(s => s.overallPerformance === 'Good').length,
        average: filteredStudents.filter(s => s.overallPerformance === 'Average').length,
        belowAverage: filteredStudents.filter(s => s.overallPerformance === 'Below Average').length,
        poor: filteredStudents.filter(s => s.overallPerformance === 'Poor').length
      }
    };
  }
}