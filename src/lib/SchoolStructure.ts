export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'annual';
    features: {
        maxStudents: number;
        maxTeachers: number;
        storage: string;
        modules: string[];
    };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
    trial: {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        billingCycle: 'monthly',
        features: {
            maxStudents: 50,
            maxTeachers: 5,
            storage: '1GB',
            modules: ['Core', 'Attendance', 'Reports'],
        },
    },
    basic: {
        id: 'basic',
        name: 'Basic Plan',
        price: 150,
        billingCycle: 'monthly',
        features: {
            maxStudents: 200,
            maxTeachers: 15,
            storage: '10GB',
            modules: ['Core', 'Attendance', 'Reports', 'Finance'],
        },
    },
    standard: {
        id: 'standard',
        name: 'Standard Plan',
        price: 300,
        billingCycle: 'monthly',
        features: {
            maxStudents: 500,
            maxTeachers: 30,
            storage: '50GB',
            modules: ['Core', 'Attendance', 'Reports', 'Finance', 'Library', 'Transport'],
        },
    },
    premium: {
        id: 'premium',
        name: 'Premium Plan',
        price: 500,
        billingCycle: 'monthly',
        features: {
            maxStudents: 2000,
            maxTeachers: 100,
            storage: 'Unlimited',
            modules: ['All Modules', 'API Access', 'Priority Support'],
        },
    },
};
