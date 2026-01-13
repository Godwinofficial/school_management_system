import { supabase } from "./supabaseClient";
import { SUBSCRIPTION_PLANS } from "./SchoolStructure";

// Re-export interfaces
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
    slug: string;
}

export class SchoolService {

    // Helper to map DB row to School object
    private static mapToSchool(row: any): School {
        // Use default plan if missing
        const planId = row.subscription_plan_id || 'trial';
        const subPlan = SUBSCRIPTION_PLANS[planId];

        return {
            id: row.id,
            name: row.name,
            centerNumber: row.center_number,
            status: row.status || 'active',
            type: row.type,
            location: {
                province: row.province,
                district: row.district,
                ward: row.ward || undefined,
            },
            contact: {
                email: row.email || '',
                phone: row.phone,
            },
            subscription: {
                plan: {
                    id: subPlan?.id || 'trial',
                    name: subPlan?.name || 'Trial',
                    features: subPlan?.features || { maxStudents: 0, maxTeachers: 0 },
                },
                billingCycle: row.billing_cycle || 'monthly',
                startDate: row.subscription_start_date || new Date().toISOString(),
                expiryDate: row.subscription_expiry_date || new Date().toISOString(),
            },
            stats: {
                totalStudents: row.total_enrolment || 0,
                totalTeachers: 0, // fetching this would require a separate count query usually
            },
            slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        };
    }

    static async getAllSchools(): Promise<School[]> {
        const { data, error } = await supabase
            .from('schools')
            .select('*');
        // .order('created_at', { ascending: false }); // Commented out until column is added

        if (error) {
            console.error('Error fetching schools:', error);
            return [];
        }

        return data.map(this.mapToSchool);
    }

    static async getSchool(id: string): Promise<School | null> {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching school:', error);
            return null;
        }

        return this.mapToSchool(data);
    }

    static async getSchoolBySlug(slug: string): Promise<School | null> {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('Error fetching school by slug:', error);
            return null;
        }

        return this.mapToSchool(data);
    }

    static async createSchool(data: SchoolData, createdBy: string): Promise<School> {
        // Generate a readable slug for the School ID
        // e.g. "Lusaka Primary" + "101" -> "lusaka-primary-101"
        const slugName = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slugCenter = data.centerNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newSchoolId = `${slugName}-${slugCenter}`;

        // Calculate expiry
        const startDate = new Date(data.startDate);
        const expiryDate = new Date(startDate);
        if (data.billingCycle === 'annual') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        // Generate a clean slug for the school
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const dbPayload = {
            id: newSchoolId,
            name: data.name,
            slug: slug, // Explicitly save slug
            center_number: data.centerNumber,
            province: data.location.province,
            district: data.location.district,
            ward: data.location.ward,
            type: data.type,
            email: data.contact.email,
            phone: data.contact.phone,
            status: 'active',
            standard_capacity: 500,
            total_enrolment: 0
        };

        const { data: inserted, error } = await supabase
            .from('schools')
            .insert([dbPayload])
            .select()
            .single();

        if (error) {
            console.error('Error creating school:', error);
            throw error;
        }

        // Create initial profiles (Head & Senior Teacher)
        await this.createInitialProfiles(inserted.id, data);

        // Initialize classes
        await this.initializeClasses(inserted.id);

        return this.mapToSchool(inserted);
    }

    static async updateSchool(id: string, data: Partial<SchoolData>): Promise<School | null> {
        const updates: any = {};
        if (data.name) updates.name = data.name;
        if (data.centerNumber) updates.center_number = data.centerNumber;
        if (data.location?.province) updates.province = data.location.province;
        if (data.location?.district) updates.district = data.location.district;
        if (data.location?.ward) updates.ward = data.location.ward;
        if (data.type) updates.type = data.type;
        if (data.contact?.email) updates.email = data.contact.email;
        if (data.contact?.phone) updates.phone = data.contact.phone;
        if (data.subscriptionPlanId) updates.subscription_plan_id = data.subscriptionPlanId;
        if (data.billingCycle) updates.billing_cycle = data.billingCycle;

        const { data: updated, error } = await supabase
            .from('schools')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating school:', error);
            return null;
        }

        return this.mapToSchool(updated);
    }

    static async toggleSchoolStatus(id: string): Promise<School | null> {
        // First get current status
        const { data: current } = await supabase.from('schools').select('status').eq('id', id).single();
        if (!current) return null;

        const newStatus = current.status === 'active' ? 'inactive' : 'active';

        const { data: updated, error } = await supabase
            .from('schools')
            .update({ status: newStatus })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error toggling status:', error);
            return null;
        }

        return this.mapToSchool(updated);
    }

    static async deleteSchool(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('schools')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting school:', error);
            return false;
        }

        return true;
    }

    static sendWelcomeEmail(school: School): void {
        console.log(`Sending welcome email to ${school.contact.email} for ${school.name}`);
        // In real prod, call an Edge Function here
    }

    private static async createInitialProfiles(schoolId: string, data: SchoolData) {
        const headEmail = data.contact.email;
        const seniorEmail = `senior.${data.contact.email}`;

        const profiles = [
            {
                email: headEmail,
                first_name: 'Head',
                last_name: 'Teacher',
                role: 'head_teacher',
                school_id: schoolId,
                province: data.location.province,
                district: data.location.district,
                metadata: {
                    permissions: ['manage_staff', 'manage_students', 'manage_classes', 'manage_assessments', 'view_reports', 'manage_settings', 'manage_finance']
                }
            },
            {
                email: seniorEmail,
                first_name: 'Senior',
                last_name: 'Teacher',
                role: 'senior_teacher',
                school_id: schoolId,
                province: data.location.province,
                district: data.location.district,
                metadata: {
                    permissions: ['manage_students', 'manage_classes', 'manage_assessments', 'view_reports']
                }
            }
        ];

        const { error } = await supabase
            .from('profiles')
            .insert(profiles);

        if (error) {
            console.error('Error creating profiles:', error);
        }
    }

    static async getClasses(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', schoolId)
            .order('level', { ascending: true },)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching classes:', error);
            return [];
        }

        return data;
    }

    static async createClass(classData: any): Promise<any> {
        const { data, error } = await supabase
            .from('classes')
            .insert(classData)
            .select()
            .single();

        if (error) {
            console.error('Error creating class:', error);
            throw error;
        }

        return data;
    }

    static async createClasses(classesData: any[]): Promise<any[]> {
        const { data, error } = await supabase
            .from('classes')
            .insert(classesData)
            .select();

        if (error) {
            console.error('Error creating batch classes:', error);
            throw error;
        }

        return data || [];
    }

    static async updateClass(id: string, updates: any): Promise<any> {
        const { data, error } = await supabase
            .from('classes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating class:', error);
            throw error;
        }

        return data;
    }

    static async deleteClass(id: string): Promise<void> {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    }

    static async getTeachers(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role')
            .eq('school_id', schoolId)
            .in('role', ['head_teacher', 'deputy_head', 'senior_teacher', 'class_teacher']);

        if (error) {
            console.error('Error fetching teachers:', error);
            return [];
        }

        return data;
    }

    static async getSubjects(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('subjects')
            .select('*');

        if (error) {
            console.error('Error fetching subjects:', error);
            return [];
        }

        return data;
    }

    private static async initializeClasses(schoolId: string) {
        const classes = [];
        for (let i = 1; i <= 12; i++) {
            classes.push({
                id: `${schoolId}_g${i}a`,
                school_id: schoolId,
                name: `Grade ${i}A`,
                level: i,
                stream: 'A',
                capacity: 40
            });
        }

        const { error } = await supabase
            .from('classes')
            .insert(classes);

        if (error) {
            console.error('Error initializing classes:', error);
        }
    }
}

