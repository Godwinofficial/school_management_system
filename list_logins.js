
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listEnrolments() {
    const { data: students } = await supabase
        .from('students')
        .select('first_name, surname, enrolment_number')
        .limit(5);

    console.log("Here are some valid student logins:");
    students.forEach(s => {
        if (s.enrolment_number) {
            console.log(`- ${s.first_name} ${s.surname}: Login/Pass = ${s.enrolment_number}`);
        }
    });
}

listEnrolments();
