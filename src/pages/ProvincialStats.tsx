import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { BarChart3, TrendingUp, Users, School, Map } from "lucide-react";
import { useState, useMemo } from "react";

export default function ProvincialStats() {
    const user = AuthService.getCurrentUser();

    const userLevel = AuthService.getUserLevel();
    const province = user?.province || '';

    const allowed = userLevel === 'provincial' || user?.role === 'super_admin' || (user?.role && user.role.startsWith('provincial_'));

    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

    // derive schools and districts for this province
    const schoolsInProvince = useMemo(() => StorageService.getSchools().filter(s => s.province === province), [province]);
    const districts = useMemo(() => Array.from(new Set(schoolsInProvince.map(s => s.district))).sort(), [schoolsInProvince]);

    // compute stats depending on selectedDistrict; default to whole province
    const { totalSchools, totalStudents, performanceStats } = useMemo(() => {
        const targetSchools = selectedDistrict === 'all' ? schoolsInProvince : schoolsInProvince.filter(s => s.district === selectedDistrict);
        const schoolIds = targetSchools.map(s => s.id);
        const students = StorageService.getStudents().filter(st => schoolIds.includes(st.schoolId));

        const perfCounts = {
            excellent: students.filter(s => s.overallPerformance === 'Excellent').length,
            good: students.filter(s => s.overallPerformance === 'Good').length,
            average: students.filter(s => s.overallPerformance === 'Average').length,
            belowAverage: students.filter(s => s.overallPerformance === 'Below Average').length,
            poor: students.filter(s => s.overallPerformance === 'Poor').length,
        };

        return {
            totalSchools: targetSchools.length,
            totalStudents: students.length,
            performanceStats: perfCounts
        };
    }, [province, selectedDistrict, schoolsInProvince]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Provincial Statistics</h1>
                <p className="text-muted-foreground">Overview of performance and metrics for {user?.province} Province</p>
                <div className="mt-3">
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="All districts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All districts</SelectItem>
                            {districts.map(d => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!allowed ? (
                <div className="p-6 bg-yellow-50 rounded">
                    <h2 className="text-lg font-semibold">Access restricted</h2>
                    <p className="text-sm text-muted-foreground">You do not have provincial access to view these statistics.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Districts</CardTitle>
                            <Map className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{districts.length}</div>
                            <p className="text-xs text-muted-foreground">Distinct districts in {province}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                            <School className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSchools}</div>
                            <p className="text-xs text-muted-foreground">Schools ({selectedDistrict === 'all' ? 'province' : selectedDistrict})</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStudents}</div>
                            <p className="text-xs text-muted-foreground">Enrollment (selected)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Excellent %</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Math.round((performanceStats?.excellent || 0) / Math.max(1, totalStudents) * 100)}%</div>
                            <p className="text-xs text-muted-foreground">Approx. excellent performers</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>District Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            District comparison chart
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Enrollment trend chart
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
