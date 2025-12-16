import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StorageService, Teacher, Class } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AddTeacher() {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    const userLevel = AuthService.getUserLevel();

    const [classes, setClasses] = useState<Class[]>([]);
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

    useEffect(() => {
        // Load classes for assignment
        const loadedClasses = StorageService.getClasses(
            userLevel === 'school' ? user?.school?.id : undefined
        );
        setClasses(loadedClasses);
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
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.email || !formData.contactNumber) {
            toast.error("Please provide contact information");
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

        // Save teacher
        StorageService.saveTeacher(newTeacher);

        // Update classes where this teacher is assigned
        formData.assignedClassIds.forEach(classId => {
            const cls = classes.find(c => c.id === classId);
            if (cls) {
                // If teacher is assigned as class teacher for this class
                if (formData.position === 'Teacher' || formData.position === 'Senior Teacher') {
                    // Optionally set as class teacher if not already set
                    if (!cls.teacherId) {
                        cls.teacherId = newTeacher.id;
                        StorageService.saveClass(cls);
                    }
                }
            }
        });

        toast.success("Teacher added successfully!");
        navigate("/teachers");
    };

    const commonSubjects = [
        "Mathematics", "English", "Science", "Social Studies",
        "Physics", "Chemistry", "Biology", "Geography",
        "History", "Computer Science", "Physical Education",
        "Art", "Music", "Religious Education"
    ];

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/teachers")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
                    <p className="text-muted-foreground mt-1">
                        Create a new teacher record and assign classes
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
                                    <Select value={subjectInput} onValueChange={setSubjectInput}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {commonSubjects.map(subject => (
                                                <SelectItem key={subject} value={subject}>
                                                    {subject}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" onClick={handleAddSubject}>
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
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {classes.map(cls => (
                                        <div
                                            key={cls.id}
                                            className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer"
                                            onClick={() => handleClassToggle(cls.id)}
                                        >
                                            <Checkbox
                                                id={`class-${cls.id}`}
                                                checked={formData.assignedClassIds.includes(cls.id)}
                                                onCheckedChange={() => handleClassToggle(cls.id)}
                                            />
                                            <label
                                                htmlFor={`class-${cls.id}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="font-medium">{cls.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Stream {cls.stream} • Grade {cls.level}
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {formData.assignedClassIds.length > 0 && (
                                <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                    <p className="text-sm font-medium">
                                        {formData.assignedClassIds.length} class(es) selected
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/teachers")}
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
