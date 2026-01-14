import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SchoolService, School } from "@/lib/SchoolService";
import { StorageService } from "@/lib/storage";
import { AuthService, User, UserPermission, DEFAULT_PERMISSIONS } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient"; // Added import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, MapPin, Users, School as SchoolIcon, TrendingUp, AlertTriangle, Phone, Mail, CreditCard, Calendar, Edit, User as UserIcon, Shield, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

export default function AdminSchoolDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);
    const [schoolUsers, setSchoolUsers] = useState<User[]>([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        centerNumber: '',
        province: '',
        district: '',
        email: '',
        phone: ''
    });
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<UserPermission[]>([]);

    useEffect(() => {
        const fetchSchoolData = async () => {
            if (!id) return;

            try {
                const foundSchool = await SchoolService.getSchool(id);
                if (foundSchool) {
                    setSchool(foundSchool);

                    // Fetch staff from profiles
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('school_id', id);

                    let mappedUsers: User[] = [];
                    if (profiles) {
                        mappedUsers = profiles.map(p => ({
                            id: p.id,
                            email: p.email,
                            firstName: p.first_name || '',
                            lastName: p.last_name || '',
                            role: p.role as any,
                            permissions: p.metadata?.permissions || []
                        }));
                    }

                    // Also fetch from local storage mock DB to ensure consistency in dev mode
                    const localUsers = AuthService.getUsersBySchool(id);

                    // Merge users (prefer local if duplicates by email, or union?)
                    // Simple union by email
                    const allUsers = [...mappedUsers];
                    localUsers.forEach(localU => {
                        if (!allUsers.find(u => u.email === localU.email)) {
                            allUsers.push(localU);
                        }
                    });

                    setSchoolUsers(allUsers);

                    setEditForm({
                        name: foundSchool.name,
                        centerNumber: foundSchool.centerNumber,
                        province: foundSchool.location.province,
                        district: foundSchool.location.district,
                        email: foundSchool.contact.email,
                        phone: foundSchool.contact.phone || ''
                    });
                } else {
                    navigate("/admin/schools");
                }
            } catch (error) {
                console.error("Failed to load school", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolData();
    }, [id, navigate]);

    const handleProvisionAccounts = () => {
        if (!school) return;

        // Generate clean domain from school name
        // e.g. "Lusaka Primary School" -> "lusakaprimaryschool.edu" But user requested specific casing potentially? 
        // We will standartize to CamelCase for display but emails are usually lower.
        // User asked for "support@Lusakaprimaryschool.edu". 
        // Let's clean the name: Remove spaces, keep casting? Email usually lowercase.
        // I will use lowercase for reliability.
        const cleanName = school.name.replace(/[^a-zA-Z0-9]/g, '');
        const domain = `${cleanName}.edu`.toLowerCase();

        const newUsers: User[] = [];
        let addedHead = false;
        let addedSenior = false;

        if (!schoolUsers.find(u => u.role === 'head_teacher')) {
            const head: User = {
                id: crypto.randomUUID(),
                email: `support@${domain}`,
                firstName: 'Head',
                lastName: 'Teacher',
                role: 'head_teacher',
                school: {
                    id: school.id,
                    name: school.name,
                    type: school.type as any,
                    province: school.location.province,
                    district: school.location.district,
                    ward: school.location.ward || '',
                    standardCapacity: school.subscription.plan.features.maxStudents || 500,
                    totalEnrolment: school.stats.totalStudents,
                    centerNumber: school.centerNumber,
                    slug: school.slug || ''
                },
                permissions: DEFAULT_PERMISSIONS.head_teacher
            };
            AuthService.registerUser(head);
            newUsers.push(head);
            addedHead = true;
        }

        if (!schoolUsers.find(u => u.role === 'senior_teacher')) {
            const senior: User = {
                id: crypto.randomUUID(),
                email: `senior.support@${domain}`,
                firstName: 'Senior',
                lastName: 'Teacher',
                role: 'senior_teacher',
                school: {
                    id: school.id,
                    name: school.name,
                    type: school.type as any,
                    province: school.location.province,
                    district: school.location.district,
                    ward: school.location.ward || '',
                    standardCapacity: school.subscription.plan.features.maxStudents || 500,
                    totalEnrolment: school.stats.totalStudents,
                    centerNumber: school.centerNumber,
                    slug: school.slug || ''
                },
                permissions: DEFAULT_PERMISSIONS.senior_teacher
            };
            AuthService.registerUser(senior);
            newUsers.push(senior);
            addedSenior = true;
        }

        if (newUsers.length > 0) {
            setSchoolUsers(prev => [...prev, ...newUsers]);
            toast({
                title: "Accounts Provisioned",
                description: `Created default accounts for: ${addedHead ? 'Head Teacher' : ''} ${addedSenior ? 'Senior Teacher' : ''}`,
            });
        } else {
            toast({
                title: "No Action Needed",
                description: "Key administration accounts already exist.",
            });
        }
    };

    const handleUpdateSchool = async () => {
        if (!school) return;

        const updated = await SchoolService.updateSchool(school.id, {
            name: editForm.name,
            centerNumber: editForm.centerNumber,
            location: {
                province: editForm.province,
                district: editForm.district,
                ward: school.location.ward // Keep existing ward for now
            },
            contact: {
                email: editForm.email,
                phone: editForm.phone
            }
        });

        if (updated) {
            setSchool(updated);
            setIsEditOpen(false);
            toast({
                title: "School Updated",
                description: "School details have been successfully updated.",
            });
        }
    };

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [userForm, setUserForm] = useState<{
        id?: string,
        firstName: string,
        lastName: string,
        email: string,
        role: User['role']
    }>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'subject_teacher'
    });

    const handleOpenPermissions = (user: User) => {
        setSelectedUser(user);
        setSelectedPermissions(user.permissions || DEFAULT_PERMISSIONS[user.role] || []);
        setIsPermissionsOpen(true);
    };

    const handleSavePermissions = async () => {
        if (selectedUser) {
            // Update permissions in metadata (Supabase)
            const { error } = await supabase
                .from('profiles')
                .update({
                    metadata: { permissions: selectedPermissions }
                })
                .eq('email', selectedUser.email);

            // Update in Local AuthService (mock DB)
            AuthService.updateUser(selectedUser.email, { permissions: selectedPermissions });

            if (!error) {
                // Update local state in UI
                setSchoolUsers(prev => prev.map(u =>
                    u.email === selectedUser.email ? { ...u, permissions: selectedPermissions } : u
                ));

                setIsPermissionsOpen(false);
                toast({
                    title: "Permissions Updated",
                    description: `Permissions for ${selectedUser.firstName} have been updated in system.`,
                });
            } else {
                // Fallback for local-only users (Supabase might fail if they don't exist there, but local worked)
                setSchoolUsers(prev => prev.map(u =>
                    u.email === selectedUser.email ? { ...u, permissions: selectedPermissions } : u
                ));
                setIsPermissionsOpen(false);
                toast({
                    title: "Permissions Updated (Local)",
                    description: `Permissions updated. Note: Sync to cloud may have failed if user is local-only.`,
                });
            }
        }
    };

    const handleEditUser = (user: User) => {
        setUserForm({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        });
        setIsAddUserOpen(true);
    };

    const handleSaveUser = () => {
        if (!school) return;

        if (userForm.id) {
            // Update existing
            AuthService.updateUser(userForm.email, {
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                role: userForm.role
            });

            // Update UI
            setSchoolUsers(prev => prev.map(u =>
                u.id === userForm.id ? { ...u, ...userForm } : u
            ));

            toast({ title: "User Updated", description: "User details updated successfully." });
        } else {
            // Create new
            const newUser: User = {
                id: crypto.randomUUID(),
                email: userForm.email,
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                role: userForm.role,
                school: { ...school, slug: school.slug || '' },
                permissions: DEFAULT_PERMISSIONS[userForm.role]
            };
            AuthService.registerUser(newUser);
            setSchoolUsers(prev => [...prev, newUser]);
            toast({ title: "User Created", description: `Account created. Default password is '123456'.` });
        }
        setIsAddUserOpen(false);
        setUserForm({ firstName: '', lastName: '', email: '', role: 'subject_teacher' }); // Reset
    };


    const togglePermission = (permission: UserPermission) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const headTeacher = schoolUsers.find(u => u.role === 'head_teacher');
    const seniorTeacher = schoolUsers.find(u => u.role === 'senior_teacher');

    const allPermissions: { id: UserPermission; label: string }[] = [
        { id: 'manage_staff', label: 'Manage Staff' },
        { id: 'manage_students', label: 'Manage Students' },
        { id: 'manage_classes', label: 'Manage Classes' },
        { id: 'manage_assessments', label: 'Manage Assessments' },
        { id: 'view_reports', label: 'View Reports' },
        { id: 'manage_settings', label: 'Manage Settings' },
        { id: 'manage_finance', label: 'Manage Finance' },
    ];

    if (loading || !school) return null;

    const baseSchool = StorageService.getSchool(school.id);
    const capacity = baseSchool?.standardCapacity || 500;
    const utilization = Math.round((school.stats.totalStudents / capacity) * 100);

    const getCapacityStatus = (utilization: number) => {
        if (utilization > 100) return { status: 'Over Capacity', color: 'destructive' };
        if (utilization > 90) return { status: 'Near Capacity', color: 'warning' };
        if (utilization > 70) return { status: 'Good Utilization', color: 'default' };
        return { status: 'Under Capacity', color: 'secondary' };
    };

    const capacityStatus = getCapacityStatus(utilization);


    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/schools">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">School Details</h1>
                        <p className="text-muted-foreground">Manage school account and subscription</p>
                    </div>
                </div>
                <Button onClick={() => setIsEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                </Button>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit School Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>School Name</Label>
                                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Center Number</Label>
                                <Input value={editForm.centerNumber} onChange={e => setEditForm({ ...editForm, centerNumber: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Province</Label>
                                <Input value={editForm.province} onChange={e => setEditForm({ ...editForm, province: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>District</Label>
                                <Input value={editForm.district} onChange={e => setEditForm({ ...editForm, district: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateSchool}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Profile Header Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-transparent">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="h-24 w-24 rounded-lg bg-white shadow-sm flex items-center justify-center border">
                            <SchoolIcon className="h-12 w-12 text-purple-600" />
                        </div>
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">{school.name}</h2>
                                <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                                    {school.status.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{school.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {school.location.district}, {school.location.province}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">Center No:</span>
                                    {school.centerNumber}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">Plan:</span>
                                    {school.subscription.plan.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">Expiry:</span>
                                    {school.subscription.expiryDate}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Portal Link Card */}
            <Card className="border-purple-100 bg-purple-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-purple-900">School Portal Access Link</p>
                            <p className="text-xs text-purple-600/80">Share this link with school administrators and students</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <code className="hidden sm:block px-3 py-1.5 rounded-md bg-white border border-purple-200 text-xs font-mono text-purple-800">
                            {`${window.location.origin}/login?schoolId=${school.id}`}
                        </code>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="text-purple-700 bg-white border border-purple-200 hover:bg-purple-50"
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/login?schoolId=${school.id}`);
                                toast({
                                    title: "Link Copied",
                                    description: "Portal link copied to clipboard",
                                    className: "bg-purple-600 text-white border-none"
                                });
                            }}
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{school.stats.totalStudents.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Active students</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Capacity</CardTitle>
                                <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{capacity.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground">Standard capacity</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Utilization</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{utilization}%</div>
                                <Progress value={utilization} className="mt-2 h-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-sm">{capacityStatus.status}</div>
                                <Badge variant={capacityStatus.color as any} className="mt-1">
                                    {capacityStatus.status}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{school.contact.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{school.contact.email}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <span>
                                        {school.location.ward ? `${school.location.ward}, ` : ''}
                                        {school.location.district}, {school.location.province}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Key Administration</CardTitle>
                                {(!headTeacher || !seniorTeacher) && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setIsAddUserOpen(true)} className="h-8">
                                            <UserIcon className="h-3 w-3 mr-2" />
                                            Add Custom
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleProvisionAccounts} className="h-8">
                                            <Shield className="h-3 w-3 mr-2" />
                                            Auto-Generate
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <UserIcon className="h-4 w-4" />
                                            Head Teacher
                                        </div>
                                        {headTeacher && (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(headTeacher)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenPermissions(headTeacher)}>
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Privileges
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {headTeacher ? (
                                        <div className="pl-6 group hover:bg-muted/50 p-2 rounded-md transition-colors">
                                            <div className="font-medium">{headTeacher.firstName} {headTeacher.lastName}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                {headTeacher.email}
                                                <Badge variant="outline" className="text-[10px] h-5">Password: 123456</Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pl-6 text-sm text-muted-foreground italic">Not assigned</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <UserIcon className="h-4 w-4" />
                                            Senior Teacher
                                        </div>
                                        {seniorTeacher && (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(seniorTeacher)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenPermissions(seniorTeacher)}>
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Privileges
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {seniorTeacher ? (
                                        <div className="pl-6 group hover:bg-muted/50 p-2 rounded-md transition-colors">
                                            <div className="font-medium">{seniorTeacher.firstName} {seniorTeacher.lastName}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                {seniorTeacher.email}
                                                <Badge variant="outline" className="text-[10px] h-5">Password: 123456</Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pl-6 text-sm text-muted-foreground italic">Not assigned</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="subscription">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Management</CardTitle>
                            <CardDescription>Manage plan and billing</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium">Current Plan</span>
                                    </div>
                                    <p className="text-2xl font-bold">{school.subscription.plan.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {school.subscription.plan.features.maxStudents} Students Limit
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        <span className="font-medium">Next Billing</span>
                                    </div>
                                    <p className="text-2xl font-bold">{school.subscription.expiryDate}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Auto-renewal enabled
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline">Cancel Subscription</Button>
                                <Button>Upgrade Plan</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Staff Management</CardTitle>
                                <CardDescription>Manage school staff and their privileges</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsAddUserOpen(true)}>
                                <UserIcon className="h-4 w-4 mr-2" />
                                Add Staff
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {schoolUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                                <Badge variant="outline" className="mt-1">{user.role?.replace('_', ' ')}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenPermissions(user)}>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Privileges
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {schoolUsers.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No staff members found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Privileges</DialogTitle>
                        <DialogDescription>
                            Adjust access rights for {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.role.replace('_', ' ')})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {allPermissions.map((perm) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={perm.id}
                                    checked={selectedPermissions.includes(perm.id)}
                                    onCheckedChange={() => togglePermission(perm.id)}
                                />
                                <Label htmlFor={perm.id}>{perm.label}</Label>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSavePermissions}>Save Privileges</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit User Dialog */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{userForm.id ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {userForm.id ? 'Modify user details.' : 'Create a new staff account for this school.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={userForm.firstName}
                                    onChange={e => setUserForm({ ...userForm, firstName: e.target.value })}
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={userForm.lastName}
                                    onChange={e => setUserForm({ ...userForm, lastName: e.target.value })}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={userForm.email}
                                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                placeholder="john.doe@school.edu"
                                disabled={!!userForm.id} // Disable email edit for now to simplify auth keys
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={userForm.role}
                                onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}
                            >
                                <option value="head_teacher">Head Teacher</option>
                                <option value="deputy_head">Deputy Head</option>
                                <option value="senior_teacher">Senior Teacher</option>
                                <option value="subject_teacher">Subject Teacher</option>
                                <option value="school_accountant">School Accountant</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveUser}>
                            {userForm.id ? 'Update User' : 'Create Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
