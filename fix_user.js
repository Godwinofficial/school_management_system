
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2];

const DEFAULT_PERMISSIONS = {
    subject_teacher: ['manage_students', 'manage_assessments', 'view_reports']
};

async function fixUser() {
    console.log(`Fixing login profile for: ${email}...`);

    // 1. Get Teacher Details
    const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .single();

    if (!teacher) {
        console.error("Teacher not found!");
        return;
    }

    console.log("Found teacher:", teacher.first_name);

    // 2. Create Profile
    const profilePayload = {
        id: teacher.id,
        email: teacher.email,
        first_name: teacher.first_name,
        last_name: teacher.surname,
        role: 'subject_teacher',
        school_id: teacher.school_id,
        province: 'Lusaka', // Defaults for school_1
        district: 'Lusaka',
        metadata: {
            permissions: DEFAULT_PERMISSIONS.subject_teacher
        }
    };

    const { error: insertError } = await supabase
        .from('profiles')
        .upsert([profilePayload]);

    if (insertError) {
        console.error("Failed to create profile:", insertError);
    } else {
        console.log("✅ Successfully created login profile for", email);
    }
}

fixUser();
