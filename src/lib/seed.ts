import { supabase } from "./supabaseClient";

export const seedDefaultSchool = async () => {
    console.log("[Seed] Checking for default school 'school_1'...");
    try {
        const { data, error } = await supabase
            .from('schools')
            .select('id')
            .eq('id', 'school_1')
            .maybeSingle();

        if (error) {
            console.error("[Seed] Error checking school:", error);
            return;
        }

        if (!data) {
            console.log("[Seed] 'school_1' not found. Creating it now...");
            // Insert the default school
            await supabase.from('schools').insert([
                {
                    id: 'school_1',
                    name: 'Lusaka Primary School',
                    slug: 'lusaka-primary-school-lps001',
                    center_number: 'LPS001',
                    province: 'Lusaka',
                    district: 'Lusaka',
                    ward: 'Ward 1',
                    type: 'GRZ',
                    email: 'head@school.zm',
                    phone: '0970000000',
                    status: 'active',
                    standard_capacity: 500,
                    total_enrolment: 480
                }
            ]);
            console.log("[Seed] Created 'school_1'");
        } else {
            console.log("[Seed] 'school_1' already exists.");
        }

        // Now seed Teacher Dashboard data
        await seedTeacherDashboardData();

    } catch (err) {
        console.error("[Seed] Unexpected error:", err);
    }
};

const seedTeacherDashboardData = async () => {
    console.log("[Seed] Seeding Teacher Dashboard Data...");

    // 1. Ensure Teacher Exists (Mock User ID 4)
    const teacherId = '4'; // Matches mock user 'teacher@school.zm' in auth.ts
    const schoolId = 'school_1';

    // Update or Insert Profile
    await supabase.from('profiles').upsert({
        id: teacherId,
        email: 'teacher@school.zm',
        first_name: 'Sarah',
        last_name: 'Kabwe',
        role: 'subject_teacher',
        school_id: schoolId,
        province: 'Lusaka',
        district: 'Lusaka'
    }, { onConflict: 'id' });

    // Update or Insert Teacher Record
    await supabase.from('teachers').upsert({
        id: teacherId, // Using same ID for simplicity linking
        school_id: schoolId,
        first_name: 'Sarah',
        surname: 'Kabwe',
        email: 'teacher@school.zm',
        employee_number: 'TS001',
        status: 'Active',
        assigned_class_ids: ['class_1'],
        subjects: ['Mathematics', 'Science']
    }, { onConflict: 'email' }); // Assuming email unique, or use ID if possible

    // 2. Ensure Class Exists
    const classId = 'class_1';
    await supabase.from('classes').upsert({
        id: classId,
        school_id: schoolId,
        name: 'Grade 7A',
        level: 7,
        stream: 'A',
        capacity: 45
    }, { onConflict: 'id' });

    // 3. Ensure Timetable
    // Check if we have any timetable for this teacher
    const { data: schedule } = await supabase.from('timetables').select('id').eq('teacher_id', teacherId).limit(1);

    if (!schedule || schedule.length === 0) {
        // Add some schedule items
        const days = [1, 2, 3, 4, 5];
        const entries = [];
        for (const day of days) {
            entries.push({
                school_id: schoolId,
                class_id: classId,
                teacher_id: teacherId,
                subject_id: 'Mathematics', // Using simple text ID for now as per schema logic
                day_of_week: day,
                start_time: '08:00',
                end_time: '09:00',
                room: 'Room 7A'
            });
            entries.push({
                school_id: schoolId,
                class_id: classId,
                teacher_id: teacherId,
                subject_id: 'Science',
                day_of_week: day,
                start_time: '10:00',
                end_time: '11:00',
                room: 'Lab 1'
            });
        }
        await supabase.from('timetables').insert(entries);
        console.log("[Seed] Inserted Timetable");
    }

    // 4. Ensure Exams
    const { count: examCount } = await supabase.from('exams').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
    if (examCount === 0) {
        await supabase.from('exams').insert([
            {
                school_id: schoolId,
                class_id: classId,
                subject: 'Mathematics',
                date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
                topic: 'Algebra II',
                total_marks: 100,
                type: 'exam'
            },
            {
                school_id: schoolId,
                class_id: classId,
                subject: 'Science',
                date: new Date(Date.now() + 86400000 * 10).toISOString(),
                topic: 'Physics Intro',
                total_marks: 50,
                type: 'quiz'
            }
        ]);
        console.log("[Seed] Inserted Exams");
    }

    // 5. Ensure Assessments
    const { count: assessCount } = await supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('teacher_id', teacherId);
    if (assessCount === 0) {
        await supabase.from('assessments').insert([
            {
                school_id: schoolId,
                class_id: classId,
                teacher_id: teacherId,
                subject: 'Mathematics',
                title: 'Homework 1',
                due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
                total_submissions: 10,
                pending_grading: 5,
                type: 'assignment'
            }
        ]);
        console.log("[Seed] Inserted Assessments");
    }

    console.log("[Seed] Teacher Dashboard Data Seeded.");
};
