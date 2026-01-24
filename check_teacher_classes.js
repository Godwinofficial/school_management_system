
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTeacherClasses() {
    console.log("Fetching teachers table data (assigned_class_ids)...");

    const { data, error } = await supabase
        .from('teachers')
        .select('id, first_name, surname, assigned_class_ids')
        .limit(5);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("Teachers Data:", JSON.stringify(data, null, 2));
}

checkTeacherClasses();
