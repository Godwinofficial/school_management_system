import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportTickets() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>View and respond to support tickets here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
