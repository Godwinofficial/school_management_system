import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalSettings() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Global Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Configure global system settings here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
