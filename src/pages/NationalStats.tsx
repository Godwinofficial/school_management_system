import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, School, Map, Globe } from "lucide-react";

export default function NationalStats() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">National Statistics</h1>
                <p className="text-muted-foreground">
                    Republic of Zambia Education Overview
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Provinces</CardTitle>
                        <Map className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">10</div>
                        <p className="text-xs text-muted-foreground">All reporting active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12,450</div>
                        <p className="text-xs text-muted-foreground">Public and Private</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2M</div>
                        <p className="text-xs text-muted-foreground">Students nationwide</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">National Pass Rate</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68.5%</div>
                        <p className="text-xs text-muted-foreground">Grade 12 Exams</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Provincial Performance Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                            Interactive Map Visualization
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Key Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Teacher-Student Ratio</span>
                                <span className="font-bold">1:48</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-warning h-full w-[80%]" />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-medium">Infrastructure Index</span>
                                <span className="font-bold">72/100</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[72%]" />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-medium">Budget Utilization</span>
                                <span className="font-bold">45%</span>
                            </div>
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                <div className="bg-success h-full w-[45%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
