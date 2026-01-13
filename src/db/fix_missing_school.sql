-- Force insert the missing school ID from the error
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
    'school_1767445474130', -- The ID from your error
    'Legacy Session School',
    'LEGACY001',
    'Lusaka',
    'Lusaka',
    'Ward 1',
    'GRZ',
    500,
    0,
    'active',
    '0977000000',
    'session@school.zm'
)
ON CONFLICT (id) DO NOTHING;
