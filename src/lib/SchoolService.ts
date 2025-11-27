import { StorageService } from "./storage";
import { AuthService, User, DEFAULT_PERMISSIONS } from "./auth";
import { SUBSCRIPTION_PLANS } from "./SchoolStructure";

export interface SchoolData {
    name: string;
    centerNumber: string;
    contact: {
        email: string;
        phone?: string;
    };
    location: {
        province: string;
        district: string;
        ward?: string;
    };
    type: string;
    subscriptionPlanId: string;
    billingCycle: 'monthly' | 'annual';
    startDate: string;
}

export interface School {
    id: string;
    name: string;
    centerNumber: string;
    status: 'active' | 'inactive';
    type: string;
    location: {
        province: string;
        district: string;
        ward?: string;
    };
    contact: {
        email: string;
        phone?: string;
    };
    subscription: {
        plan: {
            id: string;
            name: string;
            features: {
                maxStudents: number;
                maxTeachers: number;
            };
        };
        billingCycle: 'monthly' | 'annual';
        expiryDate: string;
        startDate: string;
    };
    stats: {
        totalStudents: number;
        totalTeachers: number;
    };
}

export class SchoolService {
    private static readonly SCHOOLS_EXTENDED_KEY = 'nrs_schools_extended';

    static getAllSchools(): School[] {
        const schools = StorageService.getSchools();
        const extendedData = this.getExtendedData();

        return schools.map(school => {
            const ext = extendedData[school.id] || {};
            const stats = StorageService.getStatistics('school', school.id);

            // Default subscription if missing
            const subPlan = SUBSCRIPTION_PLANS[ext.subscriptionPlanId || 'trial'];

            return {
                id: school.id,
                name: school.name,
                centerNumber: school.centerNumber,
                type: school.type,
                status: ext.status || 'active',
                location: {
                    province: school.province,
                    district: school.district,
                    ward: school.ward,
                },
                contact: {
                    email: ext.email || 'N/A',
                    phone: ext.phone,
                },
                subscription: {
                    plan: {
                        id: subPlan.id,
                        name: subPlan.name,
                        features: {
                            maxStudents: subPlan.features.maxStudents,
                            maxTeachers: subPlan.features.maxTeachers,
                        }
                    },
                    billingCycle: ext.billingCycle || 'monthly',
                    startDate: ext.startDate || new Date().toISOString(),
                    expiryDate: ext.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                },
                stats: {
                    totalStudents: stats.totalStudents,
                    totalTeachers: stats.totalTeachers,
                }
            };
        });
    }

    static getSchool(id: string): School | null {
        const schools = this.getAllSchools();
        return schools.find(s => s.id === id) || null;
    }

    static createSchool(data: SchoolData, createdBy: string): School {
        // 1. Create base school in StorageService
        const newSchoolId = `school_${Date.now()}`;
        const baseSchool = {
            id: newSchoolId,
            name: data.name,
            centerNumber: data.centerNumber,
            province: data.location.province,
            district: data.location.district,
            ward: data.location.ward || '',
            type: data.type as any,
            standardCapacity: 500, // Default
            totalEnrolment: 0,
        };
        StorageService.saveSchool(baseSchool);

        // 2. Save extended data
        const extendedData = this.getExtendedData();
        const plan = SUBSCRIPTION_PLANS[data.subscriptionPlanId];

        // Calculate expiry
        const startDate = new Date(data.startDate);
        const expiryDate = new Date(startDate);
        if (data.billingCycle === 'annual') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        extendedData[newSchoolId] = {
            status: 'active',
            email: data.contact.email,
            phone: data.contact.phone,
            subscriptionPlanId: data.subscriptionPlanId,
            billingCycle: data.billingCycle,
            startDate: data.startDate,
            expiryDate: expiryDate.toISOString().split('T')[0],
            createdBy,
            createdAt: new Date().toISOString(),
        };
        this.saveExtendedData(extendedData);

        // 3. Create Head Teacher User
        const headTeacherEmail = data.contact.email;
        const headTeacherPassword = 'password123'; // Default temporary password

        AuthService.registerUser({
            id: `user_${Date.now()}`,
            email: headTeacherEmail,
            firstName: 'Head',
            lastName: 'Teacher',
            role: 'head_teacher',
            permissions: DEFAULT_PERMISSIONS.head_teacher,
            school: {
                id: newSchoolId,
                name: data.name,
                district: data.location.district,
                province: data.location.province,
                centerNumber: data.centerNumber,
                type: data.type,
                totalEnrolment: 0,
                standardCapacity: 500
            }
        });

        // 4. Create Senior Teacher User
        const seniorTeacherEmail = `senior.${data.contact.email}`; // Convention: senior.school@email.com

        AuthService.registerUser({
            id: `user_${Date.now() + 1}`,
            email: seniorTeacherEmail,
            firstName: 'Senior',
            lastName: 'Teacher',
            role: 'senior_teacher' as any,
            permissions: DEFAULT_PERMISSIONS.senior_teacher,
            school: {
                id: newSchoolId,
                name: data.name,
                district: data.location.district,
                province: data.location.province,
                centerNumber: data.centerNumber,
                type: data.type,
                totalEnrolment: 0,
                standardCapacity: 500
            }
        });

        // 5. Initialize default classes (Grade 1-12)
        this.initializeClasses(newSchoolId);

        return this.getSchool(newSchoolId)!;
    }

    static toggleSchoolStatus(id: string): School | null {
        const extendedData = this.getExtendedData();
        if (extendedData[id]) {
            extendedData[id].status = extendedData[id].status === 'active' ? 'inactive' : 'active';
            this.saveExtendedData(extendedData);
            return this.getSchool(id);
        }
        return null;
    }

    static updateSchool(id: string, data: Partial<SchoolData>): School | null {
        // 1. Update base school in StorageService
        const schools = StorageService.getSchools();
        const schoolIndex = schools.findIndex(s => s.id === id);

        if (schoolIndex !== -1) {
            const updatedSchool = { ...schools[schoolIndex] };
            if (data.name) updatedSchool.name = data.name;
            if (data.centerNumber) updatedSchool.centerNumber = data.centerNumber;
            if (data.location) {
                updatedSchool.province = data.location.province;
                updatedSchool.district = data.location.district;
                updatedSchool.ward = data.location.ward || updatedSchool.ward;
            }
            if (data.type) updatedSchool.type = data.type as any;

            schools[schoolIndex] = updatedSchool;
            localStorage.setItem('nrs_schools', JSON.stringify(schools));
        }

        // 2. Update extended data
        const extendedData = this.getExtendedData();
        if (extendedData[id]) {
            if (data.contact?.email) extendedData[id].email = data.contact.email;
            if (data.contact?.phone) extendedData[id].phone = data.contact.phone;
            if (data.subscriptionPlanId) extendedData[id].subscriptionPlanId = data.subscriptionPlanId;
            if (data.billingCycle) extendedData[id].billingCycle = data.billingCycle;

            this.saveExtendedData(extendedData);
        }

        return this.getSchool(id);
    }

    static deleteSchool(id: string): boolean {
        // Delete from extended data
        const extendedData = this.getExtendedData();
        if (extendedData[id]) {
            delete extendedData[id];
            this.saveExtendedData(extendedData);
            return true;
        }
        return false;
    }

    static sendWelcomeEmail(school: School): void {
        console.log(`Sending welcome email to ${school.contact.email} for ${school.name}`);
        // Mock email sending
    }

    private static getExtendedData(): Record<string, any> {
        return JSON.parse(localStorage.getItem(this.SCHOOLS_EXTENDED_KEY) || '{}');
    }

    private static saveExtendedData(data: Record<string, any>): void {
        localStorage.setItem(this.SCHOOLS_EXTENDED_KEY, JSON.stringify(data));
    }

    private static initializeClasses(schoolId: string): void {
        // Create Grade 1 to 12 classes
        for (let i = 1; i <= 12; i++) {
            StorageService.saveClass({
                id: `${schoolId}_g${i}a`,
                schoolId: schoolId,
                name: `Grade ${i}A`,
                level: i,
                stream: 'A',
                capacity: 40,
                subjects: []
            });
        }
    }
}
