
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

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email to check.");
    process.exit(1);
}

async function checkUser() {
    console.log(`Checking user: ${email}...`);

    // 1. Check Profiles Table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (profileError) {
        console.error("Profile Error:", profileError);
    } else if (profile) {
        console.log("✅ User FOUND in 'profiles' table:");
        console.log(JSON.stringify(profile, null, 2));
    } else {
        console.log("❌ User NOT FOUND in 'profiles' table.");
    }

    // 2. Check Teachers Table
    const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (teacherError) {
        console.error("Teacher Error:", teacherError);
    } else if (teacher) {
        console.log("✅ User FOUND in 'teachers' table:");
        console.log(JSON.stringify(teacher, null, 2));
    } else {
        console.log("❌ User NOT FOUND in 'teachers' table.");
    }
}

checkUser();
