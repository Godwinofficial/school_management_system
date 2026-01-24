
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudents() {
    console.log(`Checking students for school_1...`);

    const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', 'school_1');

    if (error) {
        console.error("Error fetching students:", error);
        return;
    }

    console.log(`Found ${students.length} students.`);

    // Count unassigned
    const unassigned = students.filter(s => !s.class_id && (s.status === 'active' || s.status === 'Active'));
    console.log(`Unassigned (Active/active & !class_id): ${unassigned.length}`);

    // Log sample statuses
    console.log("Sample statuses:", [...new Set(students.map(s => s.status))]);

    // Log sample class_ids
    console.log("Sample class_ids:", [...new Set(students.map(s => s.class_id))]);

    if (unassigned.length === 0) {
        console.log("No unassigned students found with current filter.");
        // Check if any have null class_id regardless of status
        const nullClass = students.filter(s => !s.class_id);
        console.log(`Total students with null class_id: ${nullClass.length}`);
        if (nullClass.length > 0) {
            console.log("Statuses of null class_id students:", nullClass.map(s => s.status));
        }
    } else {
        console.log("First 3 unassigned students:");
        console.log(JSON.stringify(unassigned.slice(0, 3), null, 2));
    }
}

checkStudents();
