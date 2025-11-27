import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsers() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>School Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Manage users across all schools here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
