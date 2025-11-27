import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, DollarSign, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage your school clients and platform</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New School
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5,234</div>
                        <p className="text-xs text-muted-foreground">
                            Across all schools
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,450</div>
                        <p className="text-xs text-muted-foreground">
                            +15% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">10</div>
                        <p className="text-xs text-muted-foreground">
                            2 expiring soon
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your school clients</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">New school onboarded</p>
                                <p className="text-sm text-muted-foreground">Lusaka Primary School - 2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Payment received</p>
                                <p className="text-sm text-muted-foreground">Kitwe Secondary School - $850 - 5 hours ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
