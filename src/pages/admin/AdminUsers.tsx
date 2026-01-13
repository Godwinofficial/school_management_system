import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, User as UserIcon, Building2, Shield, MoreVertical, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { SchoolService, School } from "@/lib/SchoolService";
import { AuthService, User, UserRole, DEFAULT_PERMISSIONS } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'class_teacher' as UserRole,
        schoolId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Fetch Users (Profiles)
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    school:schools!left(id, name, type, province, district, slug, center_number)
                `);

            if (profiles) {
                const mappedUsers: User[] = profiles.map(p => ({
                    id: p.id,
                    email: p.email,
                    firstName: p.first_name || '',
                    lastName: p.last_name || '',
                    role: p.role as UserRole,
                    permissions: p.metadata?.permissions || [],
                    school: p.school ? {
                        id: p.school.id,
                        name: p.school.name,
                        type: p.school.type,
                        province: p.school.province,
                        district: p.school.district,
                        centerNumber: p.school.center_number,
                        slug: p.school.slug,
                        // Defaults for flattened structure if missing from join
                        ward: '',
                        standardCapacity: 0,
                        totalEnrolment: 0
                    } : undefined
                }));

                // Merge with local mock users for dev completeness
                // In a real app, you'd just rely on the DB.
                const mockUsers = Object.values(AuthService['getMockUsers']()); // Using internal method via bracket to avoid TS private error if strict, but methods are private. 
                // Actually AuthService.getUsersBySchool can't get ALL. 
                // We'll stick to Supabase + maybe a manual check of local storage

                setUsers(mappedUsers);
            }

            // 2. Fetch Schools for dropdown
            const schoolList = await SchoolService.getAllSchools();
            setSchools(schoolList);

        } catch (error) {
            console.error("Error fetching admin users data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        try {
            const selectedSchool = schools.find(s => s.id === formData.schoolId);

            // 1. Create User Object
            const newUser: User = {
                id: crypto.randomUUID(),
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
                school: selectedSchool ? {
                    id: selectedSchool.id,
                    name: selectedSchool.name,
                    type: selectedSchool.type as any,
                    province: selectedSchool.location.province,
                    district: selectedSchool.location.district,
                    ward: selectedSchool.location.ward || '',
                    standardCapacity: selectedSchool.subscription.plan.features.maxStudents || 500,
                    totalEnrolment: selectedSchool.stats.totalStudents,
                    centerNumber: selectedSchool.centerNumber,
                    slug: selectedSchool.slug
                } : undefined,
                permissions: DEFAULT_PERMISSIONS[formData.role]
            };

            // 2. Register in Local AuthService (Mock)
            AuthService.registerUser(newUser);

            // 3. Save to Supabase (Profiles)
            const { error } = await supabase.from('profiles').insert({
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.firstName,
                last_name: newUser.lastName,
                role: newUser.role,
                school_id: selectedSchool?.id,
                metadata: { permissions: newUser.permissions }
            });

            if (error) {
                console.error("Supabase insert error", error);
                toast({
                    title: "Cloud Sync Failed",
                    description: "User created locally but failed to save to cloud database.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "User Created",
                    description: `Successfully created account for ${newUser.firstName} ${newUser.lastName}.`
                });
            }

            // 4. Update UI
            setUsers(prev => [...prev, newUser]);
            setIsAddUserOpen(false);
            setFormData({ firstName: '', lastName: '', email: '', role: 'class_teacher', schoolId: '' }); // Reset

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
        }
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.school?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system access and roles across all schools</p>
                </div>
                <Button onClick={() => setIsAddUserOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Users</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>School</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Loading users...</TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <UserIcon className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {user.role.replace(/_/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.school ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{user.school.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">System / No School</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                            Add a new user to the system. They will default to password '123456'.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="Jane"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="jane@school.edu"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val: UserRole) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="head_teacher">Head Teacher</SelectItem>
                                    <SelectItem value="deputy_head">Deputy Head</SelectItem>
                                    <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                                    <SelectItem value="class_teacher">Class Teacher</SelectItem>
                                    <SelectItem value="school_accountant">School Accountant</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.role !== 'super_admin' && (
                            <div className="space-y-2">
                                <Label>School</Label>
                                <Select
                                    value={formData.schoolId}
                                    onValueChange={(val) => setFormData({ ...formData, schoolId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select school" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schools.map(school => (
                                            <SelectItem key={school.id} value={school.id}>
                                                {school.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
