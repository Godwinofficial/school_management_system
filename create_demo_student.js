
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function ensureStudent() {
    // 1. Check if S008 exists
    const { data: existing } = await supabase
        .from('students')
        .select('*')
        .eq('enrolment_number', 'S008')
        .maybeSingle();

    if (existing) {
        console.log(`Student S008 already exists: ${existing.first_name} ${existing.surname}`);
        return;
    }

    // 2. Insert if missing
    // Need a school ID. Let's use 'school_1' or fetch the first school.
    const { data: school } = await supabase.from('schools').select('id').limit(1).single();
    const schoolId = school ? school.id : 'school_1';

    const { error } = await supabase.from('students').insert({
        first_name: 'Demo',
        surname: 'Student_S008',
        enrolment_number: 'S008',
        school_id: schoolId,
        status: 'Active',
        gender: 'Male',
        current_grade: 8,
        date_of_birth: '2010-01-01'
    });

    if (error) {
        console.error("Error creating S008:", error);
    } else {
        console.log("Successfully created student S008.");
    }
}

ensureStudent();
