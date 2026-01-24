
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTimetable() {
    console.log("Checking Timetable entries...");

    // 1. Fetch raw table data
    const { data: rawData, error: rawError } = await supabase
        .from('timetables')
        .select('*');

    if (rawError) {
        console.error("Error fetching raw timetables:", rawError);
    } else {
        console.log(`Found ${rawData.length} raw entries.`);
        if (rawData.length > 0) {
            console.log("Sample raw entry:", rawData[0]);
        }
    }

    // 2. Fetch with relationships (reproducing the app's query)
    const { data: joinedData, error: joinedError } = await supabase
        .from('timetables')
        .select(`
            *,
            classes:class_id(name),
            subjects:subject_id(name)
        `);
    // Note: Removed profiles join initially to isolate issues

    if (joinedError) {
        console.error("Error fetching joined timetables:", joinedError);
    } else {
        console.log(`Found ${joinedData?.length || 0} joined entries.`);
        if (joinedData && joinedData.length > 0) {
            console.log("Sample joined entry:", JSON.stringify(joinedData[0], null, 2));
        }
    }
}

checkTimetable();
