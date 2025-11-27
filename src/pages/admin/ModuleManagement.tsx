import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModuleManagement() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Module Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Enable or disable system modules here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
