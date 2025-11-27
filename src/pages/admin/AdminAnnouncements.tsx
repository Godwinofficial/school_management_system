import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnnouncements() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Manage system-wide announcements here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
