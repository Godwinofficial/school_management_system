-- Seed Mock Data to match local mock users - simplified columns

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
    'school_1',
    'Lusaka Primary School',
    'LPS001',
    'Lusaka',
    'Lusaka',
    'Ward 1',
    'GRZ',
    500,
    480,
    'active',
    '0977000000',
    'head@school.zm'
)
ON CONFLICT (id) DO NOTHING;
