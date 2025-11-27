import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth";
import { BarChart3, TrendingUp, Users, School } from "lucide-react";

export default function DistrictStats() {
    const user = AuthService.getCurrentUser();

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">District Statistics</h1>
                <p className="text-muted-foreground">
                    Overview of performance and metrics for {user?.district} District
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        <School className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15,234</div>
                        <p className="text-xs text-muted-foreground">+4.5% from last term</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Pass Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">76.8%</div>
                        <p className="text-xs text-muted-foreground">+1.2% from last year</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Teacher Ratio</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1:45</div>
                        <p className="text-xs text-muted-foreground">Target is 1:40</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Chart visualization would go here
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
