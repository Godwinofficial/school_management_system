-- Seed Mock Data to match local mock users
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
    subscription_plan_id,
    subscription_start_date,
    subscription_expiry_date
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
    'trial',
    now(),
    now() + interval '1 year'
)
ON CONFLICT (id) DO NOTHING;
