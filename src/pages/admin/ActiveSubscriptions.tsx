import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActiveSubscriptions() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>View and manage active subscriptions here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
