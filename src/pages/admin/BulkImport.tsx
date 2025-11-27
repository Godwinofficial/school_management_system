import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BulkImport() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Import</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Import data in bulk here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
