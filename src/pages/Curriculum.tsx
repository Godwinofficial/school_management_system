import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Curriculum() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">National Curriculum</h1>
                <p className="text-muted-foreground">
                    Manage and review the national education curriculum and syllabi
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {['Primary Education', 'Junior Secondary', 'Senior Secondary'].map((level) => (
                    <Card key={level}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                {level}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Core subjects and electives for {level} level.
                            </p>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="mr-2 h-4 w-4" /> View Syllabus
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
