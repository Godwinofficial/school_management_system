import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionPlans() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Plans</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Manage subscription plans here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
