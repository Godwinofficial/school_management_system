import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoleTemplates() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Role Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Manage role templates and permissions here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
