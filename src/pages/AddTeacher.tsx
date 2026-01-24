import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Teacher, Class } from "@/lib/storage";
import { AuthService, DEFAULT_PERMISSIONS } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SubjectService } from "@/lib/SubjectService";

export default function AddTeacher() {
    const navigate = useNavigate();
    const { schoolSlug, id } = useParams<{ schoolSlug: string; id?: string }>();
    const user = AuthService.getCurrentUser();
    const userLevel = AuthService.getUserLevel();
    const { toast } = useToast();

    const canAssignClasses = AuthService.hasPermission('manage_classes');
    const canManageSubjects = AuthService.hasPermission('manage_subjects');

    const [isLoading, setIsLoading] = useState(!!id);
    const [classes, setClasses] = useState<Class[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        employeeNumber: "",
        firstName: "",
        surname: "",
        otherNames: "",
        gender: "Male" as "Male" | "Female",
        dateOfBirth: "",
        nationalId: "",
        contactNumber: "",
        email: "",
        qualification: "",
        subjects: [] as string[],
        assignedClassIds: [] as string[],
        position: "Teacher" as Teacher["position"],
        dateEmployed: new Date().toISOString().split('T')[0],
        status: "Active" as Teacher["status"]
    });

    const [subjectInput, setSubjectInput] = useState("");

    // Load Existing Teacher for Edit
    useEffect(() => {
        const fetchTeacher = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('teachers')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    setFormData({
                        employeeNumber: data.employee_number || "",
                        firstName: data.first_name || "",
                        surname: data.surname || "",
                        otherNames: data.other_names || "",
                        gender: data.gender || "Male",
                        dateOfBirth: data.date_of_birth || "",
                        nationalId: data.national_id || "",
                        contactNumber: data.contact_number || "",
                        email: data.email || "",
                        qualification: data.qualification || "",
                        subjects: data.subjects || [],
                        assignedClassIds: data.assigned_class_ids || [],
                        position: data.position || "Teacher",
                        dateEmployed: data.date_employed || new Date().toISOString().split('T')[0],
                        status: data.status || "Active"
                    });
                }
            } catch (err) {
                console.error("Error fetching teacher:", err);
                toast({ title: "Error", description: "Failed to load teacher data", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    useEffect(() => {
        // Auto-generate school email - ONLY ON NEW CREATION to avoid infinite loops and unintended overwrites
        if (!id && formData.firstName && formData.surname && user?.school?.name) {
            const schoolPart = (user.school.slug || user.school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).split('-')[0];
            // Format: firstnamesurname@school.edu
            const newEmail = `${formData.firstName.toLowerCase().replace(/\s+/g, '')}${formData.surname.toLowerCase().replace(/\s+/g, '')}@${schoolPart}.edu`;

            // Only update if the email is actually different from current to avoid loops
            if (formData.email !== newEmail) {
                setFormData(prev => ({ ...prev, email: newEmail }));
            }
        }
    }, [formData.firstName, formData.surname, user?.school?.name, user?.school?.slug, formData.email, id]);

    useEffect(() => {
        // Load classes and subjects for assignment from Supabase
        const loadInitialData = async () => {
            if (userLevel === 'school' && user?.school?.id) {
                // Load Classes
                const { data: classesData, error: classesError } = await supabase
                    .from('classes')
                    .select('*')
                    .eq('school_id', user.school.id);

                if (classesData) {
                    setClasses(classesData);
                }

                // Load Subjects
                const subjectsData = await SubjectService.getAllSubjects(user.school.id);
                setAvailableSubjects(subjectsData.map(s => s.name));
            }
        };
        loadInitialData();
    }, [user?.school?.id, userLevel]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSubject = () => {
        if (subjectInput.trim() && !formData.subjects.includes(subjectInput.trim())) {
            setFormData(prev => ({
                ...prev,
                subjects: [...prev.subjects, subjectInput.trim()]
            }));
            setSubjectInput("");
        }
    };

    const handleRemoveSubject = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter(s => s !== subject)
        }));
    };

    const handleClassToggle = (classId: string) => {
        if (!canAssignClasses) {
            toast({ title: 'Permission Denied', description: 'Only head teachers can assign teachers to classes', variant: 'destructive' });
            return;
        }

        setFormData(prev => ({
            ...prev,
            assignedClassIds: prev.assignedClassIds.includes(classId)
                ? prev.assignedClassIds.filter(id => id !== classId)
                : [...prev.assignedClassIds, classId]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName || !formData.surname || !formData.employeeNumber) {
            toast({ title: 'Validation Error', description: "Please fill in all required fields", variant: 'destructive' });
            return;
        }

        if (!formData.email || !formData.contactNumber) {
            toast({ title: 'Validation Error', description: "Please provide contact information", variant: 'destructive' });
            return;
        }

        // Create teacher object
        const newTeacher: Teacher = {
            id: crypto.randomUUID(),
            schoolId: user?.school?.id || "",
            employeeNumber: formData.employeeNumber,
            firstName: formData.firstName,
            surname: formData.surname,
            otherNames: formData.otherNames || undefined,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            nationalId: formData.nationalId,
            contactNumber: formData.contactNumber,
            email: formData.email,
            qualification: formData.qualification,
            subjects: formData.subjects,
            assignedClassIds: formData.assignedClassIds.length > 0 ? formData.assignedClassIds : undefined,
            position: formData.position,
            dateEmployed: formData.dateEmployed,
            status: formData.status
        };

        // Save teacher to Supabase
        const saveTeacher = async () => {
            const dbPayload: any = {
                school_id: user?.school?.id || "",
                employee_number: formData.employeeNumber,
                first_name: formData.firstName,
                surname: formData.surname,
                other_names: formData.otherNames || null,
                gender: formData.gender,
                date_of_birth: formData.dateOfBirth,
                national_id: formData.nationalId,
                contact_number: formData.contactNumber,
                email: formData.email,
                qualification: formData.qualification,
                subjects: formData.subjects,
                assigned_class_ids: formData.assignedClassIds.length > 0 ? formData.assignedClassIds : null,
                position: formData.position,
                date_employed: formData.dateEmployed,
                status: formData.status
            };

            if (id) {
                dbPayload.id = id;
            }



            // 1. Create/Update Teacher Record
            const { data: teacherData, error: teacherError } = await supabase
                .from('teachers')
                .upsert([dbPayload])
                .select()
                .single();

            if (teacherError) {
                toast({ title: 'Error', description: "Failed to save teacher: " + teacherError.message, variant: 'destructive' });
                return;
            }

            // 2. Create/Update Profile Record for Login
            const positionToRoleMap: Record<string, string> = {
                'Head Teacher': 'head_teacher',
                'Deputy Head': 'deputy_head',
                'Senior Teacher': 'senior_teacher',
                'Teacher': 'subject_teacher',
                'Career Guidance': 'career_guidance_teacher',
                'Social Welfare': 'social_welfare_teacher',
                'Accountant': 'school_accountant',
                'Boarding Teacher': 'boarding_teacher'
            };

            const role = positionToRoleMap[formData.position] || 'subject_teacher';

            const profilePayload = {
                id: teacherData.id, // Keep IDs synced
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.surname,
                role: role,
                school_id: user?.school?.id,
                province: user?.school?.province,
                district: user?.school?.district,
                metadata: {
                    permissions: (DEFAULT_PERMISSIONS as any)[role] || []
                }
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert([profilePayload]);

            if (profileError) {
                console.error("Profile creation failed:", profileError);
                toast({
                    title: 'Warning',
                    description: "Teacher record created, but login profile failed. Please check if email is unique.",
                    variant: 'destructive'
                });
            } else {
                toast({ title: "Success", description: "Teacher added and login profile created!" });
                navigate(`/${schoolSlug}/teachers`);
            }
        };

        saveTeacher();
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/${schoolSlug}/teachers`)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {id ? 'Edit Teacher' : 'Add New Teacher'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {id ? `Updating record for ${formData.firstName} ${formData.surname}` : 'Create a new teacher record and assign classes'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about the teacher</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="employeeNumber">Employee Number *</Label>
                                    <Input
                                        id="employeeNumber"
                                        placeholder="e.g., EMP001"
                                        value={formData.employeeNumber}
                                        onChange={(e) => handleInputChange("employeeNumber", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position *</Label>
                                    <Select value={formData.position} onValueChange={(value) => handleInputChange("position", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Teacher">Teacher</SelectItem>
                                            <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                                            <SelectItem value="Deputy Head">Deputy Head</SelectItem>
                                            <SelectItem value="Head Teacher">Head Teacher</SelectItem>
                                            <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                                            <SelectItem value="Social Welfare">Social Welfare</SelectItem>
                                            <SelectItem value="Accountant">Accountant</SelectItem>
                                            <SelectItem value="Boarding Teacher">Boarding Teacher</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="surname">Surname *</Label>
                                    <Input
                                        id="surname"
                                        value={formData.surname}
                                        onChange={(e) => handleInputChange("surname", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="otherNames">Other Names</Label>
                                    <Input
                                        id="otherNames"
                                        value={formData.otherNames}
                                        onChange={(e) => handleInputChange("otherNames", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationalId">National ID *</Label>
                                    <Input
                                        id="nationalId"
                                        placeholder="e.g., 123456/78/1"
                                        value={formData.nationalId}
                                        onChange={(e) => handleInputChange("nationalId", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="teacher@school.zm"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber">Phone Number *</Label>
                                    <Input
                                        id="contactNumber"
                                        placeholder="+260 XXX XXXXXX"
                                        value={formData.contactNumber}
                                        onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Professional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="qualification">Qualification *</Label>
                                    <Input
                                        id="qualification"
                                        placeholder="e.g., Bachelor of Education - Mathematics"
                                        value={formData.qualification}
                                        onChange={(e) => handleInputChange("qualification", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateEmployed">Date Employed *</Label>
                                    <Input
                                        id="dateEmployed"
                                        type="date"
                                        value={formData.dateEmployed}
                                        onChange={(e) => handleInputChange("dateEmployed", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Subjects Taught</Label>
                                <div className="flex gap-2">
                                    <Select value={subjectInput} onValueChange={setSubjectInput} disabled={!canManageSubjects}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubjects.map(subject => (
                                                <SelectItem key={subject} value={subject}>
                                                    {subject}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" onClick={handleAddSubject} disabled={!canManageSubjects}>
                                        Add
                                    </Button>
                                </div>
                                {formData.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.subjects.map(subject => (
                                            <div
                                                key={subject}
                                                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                            >
                                                {subject}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubject(subject)}
                                                    className="hover:text-destructive"
                                                    disabled={!canManageSubjects}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class Assignments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Assignments</CardTitle>
                            <CardDescription>
                                Select the classes this teacher will teach. Teachers will only see students from assigned classes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classes.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No classes available. Please create classes first.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Assign Classes</Label>
                                            <div className="text-xs text-muted-foreground">Group by grade and choose classes</div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">{formData.assignedClassIds.length} selected</div>
                                    </div>

                                    {/* Group classes by level */}
                                    {Object.entries(classes.reduce<Record<string, typeof classes>>((acc, c) => {
                                        const key = String(c.level || 'Unknown');
                                        (acc[key] = acc[key] || []).push(c);
                                        return acc;
                                    }, {})).sort((a, b) => Number(a[0]) - Number(b[0])).map(([level, clsGroup]) => {
                                        const allIds = clsGroup.map(c => c.id);
                                        const allSelected = allIds.every(id => formData.assignedClassIds.includes(id));

                                        return (
                                            <div key={level} className="border rounded-md p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-medium">Grade {level}</div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!canAssignClasses) return;
                                                                if (allSelected) {
                                                                    // remove all
                                                                    handleInputChange("assignedClassIds", formData.assignedClassIds.filter(id => !allIds.includes(id)));
                                                                } else {
                                                                    // add missing
                                                                    const merged = Array.from(new Set([...formData.assignedClassIds, ...allIds]));
                                                                    handleInputChange("assignedClassIds", merged);
                                                                }
                                                            }}
                                                            className="text-sm px-2 py-1 rounded border bg-secondary/5"
                                                            disabled={!canAssignClasses}
                                                        >
                                                            {allSelected ? 'Deselect all' : 'Select all'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                    {clsGroup.map(c => (
                                                        <label
                                                            key={c.id}
                                                            className={`flex items-center gap-2 p-2 rounded-md border ${canAssignClasses ? 'hover:bg-accent cursor-pointer' : 'opacity-80'}`}
                                                        >
                                                            <Checkbox
                                                                id={`class-${c.id}`}
                                                                checked={formData.assignedClassIds.includes(c.id)}
                                                                onCheckedChange={() => canAssignClasses && handleClassToggle(c.id)}
                                                                disabled={!canAssignClasses}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium">{c.name}</div>
                                                                <div className="text-xs text-muted-foreground">Grade {c.level}</div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Selected chips */}
                                    {formData.assignedClassIds.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {formData.assignedClassIds.map(id => {
                                                const cls = classes.find(c => c.id === id);
                                                if (!cls) return null;
                                                return (
                                                    <div key={id} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                        <span>{cls.name} (G{cls.level})</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleClassToggle(id)}
                                                            className="hover:text-destructive"
                                                            disabled={!canAssignClasses}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/${schoolSlug}/teachers`)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            Save Teacher
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
