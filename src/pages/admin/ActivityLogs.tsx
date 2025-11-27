import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityLogs() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>View system activity logs here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
