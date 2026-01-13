-- Insert the missing school ID to satisfy the foreign key constraint
INSERT INTO public.schools (
    id, 
    name, 
    center_number, 
    province, 
    district, 
    ward, 
    type, 
    standard_capacity, 
    total_enrolment, 
    status,
    phone,
    email
)
VALUES (
    'school_1767445474130',
    'Playground School (Auto-Fixed)',
    'FIX001',
    'Lusaka',
    'Lusaka',
    'Central',
    'Private',
    100,
    0,
    'active',
    '0000000000',
    'files@school.zm'
)
ON CONFLICT (id) DO NOTHING;
