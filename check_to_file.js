
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data: students } = await supabase.from('students').select('*').eq('school_id', 'school_1');
    let output = `FOUND ${students.length} STUDENTS:\n`;
    students.forEach(s => {
        output += `- ${s.first_name} ${s.surname} | ClassID: "${s.class_id}" | Status: "${s.status}"\n`;
    });
    fs.writeFileSync('output.txt', output);
}

check();
