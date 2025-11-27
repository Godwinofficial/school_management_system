import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentHistory() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>View payment history here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
