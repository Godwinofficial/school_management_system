import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Invoices() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Manage invoices here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
