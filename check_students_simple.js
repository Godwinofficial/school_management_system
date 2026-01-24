
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: students } = await supabase.from('students').select('id, first_name, class_id, status').eq('school_id', 'school_1');

    console.log(`Total students: ${students.length}`);

    const nullClass = students.filter(s => s.class_id === null);
    const emptyClass = students.filter(s => s.class_id === "");
    const undefinedClass = students.filter(s => s.class_id === undefined);

    console.log(`Null class_id: ${nullClass.length}`);
    console.log(`Empty string class_id: ${emptyClass.length}`);
    console.log(`Undefined class_id: ${undefinedClass.length}`);

    // Check statuses of those
    const unassigned = [...nullClass, ...emptyClass, ...undefinedClass];
    if (unassigned.length > 0) {
        console.log("Statuses of unassigned:");
        unassigned.forEach(s => console.log(`- ${s.first_name}: ${s.status} (class_id: '${s.class_id}')`));
    } else {
        console.log("All students have a class_id.");
    }
}

check();
