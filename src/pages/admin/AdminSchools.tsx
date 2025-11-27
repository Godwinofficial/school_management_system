import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Power, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SchoolService, type School } from "@/lib/SchoolService";
import { toast } from "@/hooks/use-toast";

export default function AdminSchools() {
    const [schools, setSchools] = useState<School[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expiring'>('all');

    useEffect(() => {
        loadSchools();
    }, []);

    const loadSchools = () => {
        const allSchools = SchoolService.getAllSchools();
        setSchools(allSchools);
    };

    const handleToggleStatus = (schoolId: string) => {
        const result = SchoolService.toggleSchoolStatus(schoolId);
        if (result) {
            toast({
                title: "Status Updated",
                description: `School is now ${result.status}`,
            });
            loadSchools();
        }
    };

    const handleDelete = (schoolId: string, schoolName: string) => {
        if (window.confirm(`Are you sure you want to delete ${schoolName}? This action cannot be undone.`)) {
            const success = SchoolService.deleteSchool(schoolId);
            if (success) {
                toast({
                    title: "School Deleted",
                    description: `${schoolName} has been removed`,
                    variant: "destructive",
                });
                loadSchools();
            }
        }
    };

    const getStatusBadge = (school: School) => {
        const daysUntilExpiry = Math.ceil(
            (new Date(school.subscription.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (school.status === 'inactive') {
            return <Badge variant="secondary">Inactive</Badge>;
        } else if (daysUntilExpiry <= 30) {
            return <Badge variant="destructive">Expiring Soon</Badge>;
        } else {
            return <Badge variant="default">Active</Badge>;
        }
    };

    const filteredSchools = schools.filter(school => {
        // Search filter
        const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.centerNumber.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const daysUntilExpiry = Math.ceil(
            (new Date(school.subscription.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        let matchesStatus = true;
        if (filterStatus === 'active') {
            matchesStatus = school.status === 'active' && daysUntilExpiry > 30;
        } else if (filterStatus === 'inactive') {
            matchesStatus = school.status === 'inactive';
        } else if (filterStatus === 'expiring') {
            matchesStatus = daysUntilExpiry <= 30 && school.status === 'active';
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Schools Management</h1>
                    <p className="text-muted-foreground mt-2">Manage your school clients</p>
                </div>
                <Link to="/admin/schools/add">
                    <Button className="bg-gradient-to-r from-purple-500 to-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New School
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search schools..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterStatus === 'active' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('active')}
                            >
                                Active
                            </Button>
                            <Button
                                variant={filterStatus === 'expiring' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('expiring')}
                            >
                                Expiring
                            </Button>
                            <Button
                                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('inactive')}
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schools Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Schools ({filteredSchools.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredSchools.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No schools found</p>
                            <Link to="/admin/schools/add">
                                <Button className="mt-4" variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First School
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">School Name</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Plan</th>
                                        <th className="text-left p-4 font-medium">Expiry Date</th>
                                        <th className="text-left p-4 font-medium">Students</th>
                                        <th className="text-left p-4 font-medium">Teachers</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSchools.map((school) => (
                                        <tr key={school.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{school.name}</p>
                                                    <p className="text-sm text-muted-foreground">{school.centerNumber}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(school)}
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{school.subscription.plan.name}</p>
                                                    <p className="text-sm text-muted-foreground">{school.subscription.billingCycle}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">{school.subscription.expiryDate}</td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{school.stats.totalStudents}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        / {school.subscription.plan.features.maxStudents}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{school.stats.totalTeachers}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        / {school.subscription.plan.features.maxTeachers}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Link to={`/admin/schools/${school.id}`}>
                                                        <Button size="sm" variant="ghost" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title="Edit School"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title={school.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        onClick={() => handleToggleStatus(school.id)}
                                                    >
                                                        <Power className={`w-4 h-4 ${school.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title="Delete School"
                                                        onClick={() => handleDelete(school.id, school.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
