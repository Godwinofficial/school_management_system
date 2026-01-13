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
  slug?: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  employeeNumber: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  nationalId: string;
  contactNumber: string;
  email: string;
  qualification: string;
  subjects: string[];
  assignedClassIds?: string[]; // Classes where this teacher teaches (as class teacher or subject teacher)
  position: 'Head Teacher' | 'Deputy Head' | 'Senior Teacher' | 'Teacher' | 'Career Guidance' | 'Social Welfare' | 'Accountant' | 'Boarding Teacher';
  dateEmployed: string;
  status: 'Active' | 'On Leave' | 'Transferred' | 'Resigned';
}

export interface Class {
  id: string;
  schoolId: string;
  name: string; // e.g., "Grade 7A", "Form 1B"
  level: number; // 1-12
  stream: string; // A, B, C, etc.
  capacity: number;
  teacherId?: string; // Class teacher
  subjects: {
    subjectId: string;
    subjectName: string;
    teacherId: string;
  }[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  level: number[];
  description?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  classId?: string; // Assigned class
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
  email?: string;
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  previousSchool?: string;

  // Family Information (Traditional)
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

  // Unified Family Info (for imports/simplified views)
  parentGuardian?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email: string;
    address: string;
    occupation: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  // Academic Information
  currentLevel: number; // 1-12
  healthStatus?: 'Good' | 'Fair' | 'Poor' | 'Special Needs' | string;
  medicalInfo?: {
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    medications?: string;
  };
  academicPerformance?: {
    [level: number]: {
      A: number;
      B: number;
      C: number;
    };
  };
  overallPerformance: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';
  careerPathways: string[];
  specialInformation?: string;
  documents?: any[];

  // Status
  status: 'Active' | 'Transferred' | 'Dropped Out' | 'Graduated' | 'Deceased' | string;
  isOrphan: boolean;
  hasDisability: boolean;
  isMarried: boolean;
}

export interface TeacherData {
  id: string;
  assignedClass: string;
  subjects: string[];
  todaysSchedule: Array<{
    time: string;
    subject: string;
    class: string;
    type: 'class' | 'meeting' | 'duty';
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
  classId: string;
  subject: string;
  date: string;
  topic: string;
  totalMarks: number;
  type: 'quiz' | 'test' | 'exam';
}

export interface Assessment {
  id: string;
  classId: string;
  subject: string;
  title: string;
  dueDate: string;
  totalSubmissions: number;
  pendingGrading: number;
  type: 'assignment' | 'project' | 'presentation';
}

export interface ClassPerformance {
  classId: string;
  subjects: Array<{
    name: string;
    averageScore: number;
    topPerformer: {
      name: string;
      score: number;
    };
    improvementNeeded: {
      name: string;
      score: number;
    };
  }>;
  overallAverage: number;
  classRank?: number;
}

export class StorageService {
  private static readonly SCHOOLS_KEY = 'nrs_schools';
  private static readonly STUDENTS_KEY = 'nrs_students';
  private static readonly TEACHERS_KEY = 'nrs_teachers';
  private static readonly CLASSES_KEY = 'nrs_classes';
  private static readonly SUBJECTS_KEY = 'nrs_subjects';
  private static readonly TEACHER_DATA_KEY = 'nrs_teacher_data';
  private static readonly CLASS_DATA_KEY = 'nrs_class_data';
  private static readonly EXAMS_KEY = 'nrs_exams';
  private static readonly ASSESSMENTS_KEY = 'nrs_assessments';

  // Teacher Dashboard Data Methods
  static getTeacherData(teacherId: string): TeacherData {
    const teacherData = JSON.parse(localStorage.getItem(this.TEACHER_DATA_KEY) || '{}');

    // Return default data if no data exists
    if (!teacherData[teacherId]) {
      return {
        id: teacherId,
        assignedClass: '7A',
        subjects: ['Mathematics', 'Physics'],
        todaysSchedule: [
          { time: '08:00 - 09:30', subject: 'Mathematics', class: '7A', type: 'class', topic: 'Algebra Basics' },
          { time: '10:00 - 11:30', subject: 'Physics', class: '9B', type: 'class', topic: 'Newton\'s Laws' },
          { time: '12:00 - 13:00', subject: 'Staff Meeting', class: 'Staff Room', type: 'meeting' },
          { time: '14:00 - 15:30', subject: 'Mathematics', class: '7A', type: 'class', topic: 'Problem Solving' },
        ]
      };
    }

    return teacherData[teacherId];
  }

  static getClassData(classId: string): ClassData | null {
    const classData = JSON.parse(localStorage.getItem(this.CLASS_DATA_KEY) || '{}');

    if (!classData[classId]) {
      // Generate some sample data
      const maleCount = Math.floor(Math.random() * 10) + 10; // 10-20 students
      const femaleCount = Math.floor(Math.random() * 10) + 10; // 10-20 students

      return {
        id: classId,
        name: classId,
        totalStudents: maleCount + femaleCount,
        genderStats: {
          male: maleCount,
          female: femaleCount
        },
        studentsNeedingAttention: [
          { id: 's1', name: 'John Banda', subject: 'Mathematics', issue: 'Low test scores', severity: 'high' },
          { id: 's2', name: 'Mary Phiri', subject: 'Physics', issue: 'Missing assignments', severity: 'medium' },
          { id: 's3', name: 'Peter Mwale', subject: 'Mathematics', issue: 'Needs extra help', severity: 'low' }
        ]
      };
    }

    return classData[classId];
  }

  static getUpcomingExams(classId: string): Exam[] {
    const exams = JSON.parse(localStorage.getItem(this.EXAMS_KEY) || '[]');
    const classExams = exams.filter((exam: Exam) => exam.classId === classId);

    if (classExams.length === 0) {
      // Return sample data if no exams found
      return [
        {
          id: 'exam1',
          classId,
          subject: 'Mathematics',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          topic: 'Algebra and Geometry',
          totalMarks: 50,
          type: 'test'
        },
        {
          id: 'exam2',
          classId,
          subject: 'Physics',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          topic: 'Mechanics',
          totalMarks: 40,
          type: 'quiz'
        }
      ];
    }

    return classExams;
  }

  static getPendingAssessments(teacherId: string): Assessment[] {
    const assessments = JSON.parse(localStorage.getItem(this.ASSESSMENTS_KEY) || '[]');
    const teacherAssessments = assessments.filter((a: any) => a.teacherId === teacherId);

    if (teacherAssessments.length === 0) {
      // Return sample data if no assessments found
      return [
        {
          id: 'assess1',
          classId: '7A',
          subject: 'Mathematics',
          title: 'Algebra Assignment',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          totalSubmissions: 25,
          pendingGrading: 12,
          type: 'assignment'
        },
        {
          id: 'assess2',
          classId: '9B',
          subject: 'Physics',
          title: 'Lab Report - Newton\'s Laws',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          totalSubmissions: 0,
          pendingGrading: 0,
          type: 'project'
        }
      ];
    }

    return teacherAssessments;
  }

  static getClassPerformance(classId: string): ClassPerformance | null {
    // In a real app, this would fetch actual performance data
    return {
      classId,
      subjects: [
        {
          name: 'Mathematics',
          averageScore: 72,
          topPerformer: { name: 'Alice Mwale', score: 98 },
          improvementNeeded: { name: 'John Banda', score: 45 }
        },
        {
          name: 'Physics',
          averageScore: 65,
          topPerformer: { name: 'James Phiri', score: 95 },
          improvementNeeded: { name: 'Mary Tembo', score: 40 }
        }
      ],
      overallAverage: 68.5,
      classRank: 3
    };
  }

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
          centerNumber: 'LPS001',
          slug: 'lusaka-primary-school-lps001'
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
          centerNumber: 'CSS002',
          slug: 'chilenje-secondary-school-css002'
        }
      ];
      localStorage.setItem(this.SCHOOLS_KEY, JSON.stringify(sampleSchools));
    }

    if (!localStorage.getItem(this.SUBJECTS_KEY)) {
      const sampleSubjects: Subject[] = [
        { id: 'sub_1', name: 'Mathematics', code: 'MATH', level: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        { id: 'sub_2', name: 'English', code: 'ENG', level: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        { id: 'sub_3', name: 'Science', code: 'SCI', level: [1, 2, 3, 4, 5, 6, 7] },
        { id: 'sub_4', name: 'Social Studies', code: 'SS', level: [1, 2, 3, 4, 5, 6, 7] },
        { id: 'sub_5', name: 'Physics', code: 'PHY', level: [8, 9, 10, 11, 12] },
        { id: 'sub_6', name: 'Chemistry', code: 'CHEM', level: [8, 9, 10, 11, 12] },
        { id: 'sub_7', name: 'Biology', code: 'BIO', level: [8, 9, 10, 11, 12] },
      ];
      localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(sampleSubjects));
    }

    if (!localStorage.getItem(this.TEACHERS_KEY)) {
      const sampleTeachers: Teacher[] = [
        {
          id: 'teacher_1',
          schoolId: 'school_1',
          employeeNumber: 'LPS001/T/001',
          firstName: 'Sarah',
          surname: 'Mwale',
          gender: 'Female',
          dateOfBirth: '1985-03-20',
          nationalId: '654321/85/1',
          contactNumber: '+260977654321',
          email: 'sarah.mwale@school.zm',
          qualification: 'Bachelor of Education - Mathematics',
          subjects: ['Mathematics', 'Physics'],
          position: 'Senior Teacher',
          dateEmployed: '2020-01-15',
          status: 'Active'
        },
        {
          id: 'teacher_2',
          schoolId: 'school_1',
          employeeNumber: 'LPS001/T/002',
          firstName: 'James',
          surname: 'Banda',
          gender: 'Male',
          dateOfBirth: '1980-07-10',
          nationalId: '543210/80/1',
          contactNumber: '+260966543210',
          email: 'james.banda@school.zm',
          qualification: 'Bachelor of Arts - English Literature',
          subjects: ['English', 'Social Studies'],
          position: 'Teacher',
          dateEmployed: '2018-08-01',
          status: 'Active'
        }
      ];
      localStorage.setItem(this.TEACHERS_KEY, JSON.stringify(sampleTeachers));
    }

    if (!localStorage.getItem(this.CLASSES_KEY)) {
      const sampleClasses: Class[] = [
        {
          id: 'class_1',
          schoolId: 'school_1',
          name: 'Grade 7A',
          level: 7,
          stream: 'A',
          capacity: 40,
          teacherId: 'teacher_1',
          subjects: [
            { subjectId: 'sub_1', subjectName: 'Mathematics', teacherId: 'teacher_1' },
            { subjectId: 'sub_2', subjectName: 'English', teacherId: 'teacher_2' },
            { subjectId: 'sub_3', subjectName: 'Science', teacherId: 'teacher_1' },
            { subjectId: 'sub_4', subjectName: 'Social Studies', teacherId: 'teacher_2' }
          ]
        },
        {
          id: 'class_2',
          schoolId: 'school_1',
          name: 'Grade 6B',
          level: 6,
          stream: 'B',
          capacity: 35,
          teacherId: 'teacher_2',
          subjects: [
            { subjectId: 'sub_1', subjectName: 'Mathematics', teacherId: 'teacher_1' },
            { subjectId: 'sub_2', subjectName: 'English', teacherId: 'teacher_2' },
            { subjectId: 'sub_3', subjectName: 'Science', teacherId: 'teacher_1' },
            { subjectId: 'sub_4', subjectName: 'Social Studies', teacherId: 'teacher_2' }
          ]
        }
      ];
      localStorage.setItem(this.CLASSES_KEY, JSON.stringify(sampleClasses));
    }

    if (!localStorage.getItem(this.STUDENTS_KEY)) {
      const sampleStudents: Student[] = [
        {
          id: 'student_1',
          schoolId: 'school_1',
          classId: 'class_1',
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
        },
        {
          id: 'student_2',
          schoolId: 'school_1',
          classId: 'class_2',
          registrationDate: '2024-01-20',
          enrolmentNumber: 'LPS001/2024/002',
          firstName: 'Grace',
          surname: 'Phiri',
          otherNames: 'Mercy',
          dateOfBirth: '2011-08-12',
          gender: 'Female',
          residentialAddress: '456 Matero Road, Lusaka',
          currentLevel: 6,
          healthStatus: 'Good',
          academicPerformance: {
            5: { A: 4, B: 3, C: 2 },
            6: { A: 3, B: 4, C: 2 }
          },
          overallPerformance: 'Excellent',
          careerPathways: ['Medicine', 'Science'],
          status: 'Active',
          isOrphan: true,
          hasDisability: false,
          isMarried: false,
          guardian: {
            firstName: 'Agnes',
            surname: 'Phiri',
            gender: 'Female',
            residentialAddress: '456 Matero Road, Lusaka',
            occupation: 'Teacher',
            dateOfBirth: '1970-05-15',
            contactNumber: '+260977987654'
          }
        }
      ];
      localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(sampleStudents));
    }
  }

  // Schools
  static getSchools(): School[] {
    const data = localStorage.getItem(this.SCHOOLS_KEY);
    const schools: School[] = data ? JSON.parse(data) : [];

    // Ensure all schools have slugs (poly-fill for old data)
    return schools.map(s => {
      if (!s.slug) {
        const nameSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const centerSlug = s.centerNumber ? `-${s.centerNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
        s.slug = `${nameSlug}${centerSlug}`;
      }
      return s;
    });
  }

  static getSchool(idOrSlug: string): School | null {
    const schools = this.getSchools();
    return schools.find(school => {
      if (!idOrSlug) return false;
      const term = idOrSlug.toLowerCase();

      // Match by ID
      if (school.id === idOrSlug) return true;
      // Match by explicit slug
      if (school.slug === idOrSlug) return true;

      // Match by generated slug (name based)
      const nameSlug = school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (nameSlug === term) return true;

      // Match by generated slug (name + center number based)
      const extendedSlug = `${nameSlug}-${school.centerNumber.toLowerCase()}`;
      if (extendedSlug === term) return true;

      // Loose match: if the search term starts with the name slug (handles variations like -lpu2026 vs -lps001)
      if (term.startsWith(nameSlug)) return true;

      // Match by center number
      if (school.centerNumber.toLowerCase() === term) return true;

      return false;
    }) || null;
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

  // Teachers
  static getTeachers(schoolId?: string): Teacher[] {
    const data = localStorage.getItem(this.TEACHERS_KEY);
    const teachers = data ? JSON.parse(data) : [];
    return schoolId ? teachers.filter((t: Teacher) => t.schoolId === schoolId) : teachers;
  }

  static getTeacher(id: string): Teacher | null {
    const teachers = this.getTeachers();
    return teachers.find(teacher => teacher.id === id) || null;
  }

  static saveTeacher(teacher: Teacher): void {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      teachers[index] = teacher;
    } else {
      teachers.push(teacher);
    }
    localStorage.setItem(this.TEACHERS_KEY, JSON.stringify(teachers));
  }

  static deleteTeacher(id: string): void {
    const teachers = this.getTeachers();
    const filtered = teachers.filter(t => t.id !== id);
    localStorage.setItem(this.TEACHERS_KEY, JSON.stringify(filtered));
  }

  // Classes
  static getClasses(schoolId?: string): Class[] {
    const data = localStorage.getItem(this.CLASSES_KEY);
    const classes = data ? JSON.parse(data) : [];
    return schoolId ? classes.filter((c: Class) => c.schoolId === schoolId) : classes;
  }

  static getClass(id: string): Class | null {
    const classes = this.getClasses();
    return classes.find(cls => cls.id === id) || null;
  }

  static saveClass(cls: Class): void {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === cls.id);
    if (index >= 0) {
      classes[index] = cls;
    } else {
      classes.push(cls);
    }
    localStorage.setItem(this.CLASSES_KEY, JSON.stringify(classes));
  }

  static deleteClass(id: string): void {
    const classes = this.getClasses();
    const filtered = classes.filter(c => c.id !== id);
    localStorage.setItem(this.CLASSES_KEY, JSON.stringify(filtered));
  }

  // Subjects
  static getSubjects(): Subject[] {
    const data = localStorage.getItem(this.SUBJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getSubject(id: string): Subject | null {
    const subjects = this.getSubjects();
    return subjects.find(subject => subject.id === id) || null;
  }

  static saveSubject(subject: Subject): void {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === subject.id);
    if (index >= 0) {
      subjects[index] = subject;
    } else {
      subjects.push(subject);
    }
    localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(subjects));
  }

  // Statistics
  static getStatistics(level: 'school' | 'district' | 'provincial' | 'national' | 'student' | 'system', contextId?: string) {
    const students = this.getStudents();
    const schools = this.getSchools();
    const teachers = this.getTeachers();
    const classes = this.getClasses();

    let filteredStudents = students;
    let filteredSchools = schools;
    let filteredTeachers = teachers;
    let filteredClasses = classes;

    if (level === 'school' && contextId) {
      filteredStudents = students.filter(s => s.schoolId === contextId);
      filteredSchools = schools.filter(s => s.id === contextId);
      filteredTeachers = teachers.filter(t => t.schoolId === contextId);
      filteredClasses = classes.filter(c => c.schoolId === contextId);
    }

    return {
      totalStudents: filteredStudents.length,
      totalSchools: filteredSchools.length,
      totalTeachers: filteredTeachers.length,
      totalClasses: filteredClasses.length,
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
      },
      teacherStats: {
        active: filteredTeachers.filter(t => t.status === 'Active').length,
        onLeave: filteredTeachers.filter(t => t.status === 'On Leave').length,
        transferred: filteredTeachers.filter(t => t.status === 'Transferred').length,
        resigned: filteredTeachers.filter(t => t.status === 'Resigned').length
      },
      capacityStats: {
        totalCapacity: filteredClasses.reduce((sum, c) => sum + c.capacity, 0),
        studentsInClasses: filteredStudents.filter(s => s.classId).length,
        unassignedStudents: filteredStudents.filter(s => !s.classId).length
      }
    };
  }
}