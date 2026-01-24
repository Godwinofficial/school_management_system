import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/lib/storage";
import { StudentService } from "@/lib/StudentService";
import { AuthService } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Save, Loader2, Search } from "lucide-react";
import { SchoolService } from "@/lib/SchoolService";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AddStudent() {
  const navigate = useNavigate();
  const { schoolSlug, id } = useParams();
  const user = AuthService.getCurrentUser();

  if (!AuthService.hasPermission('manage_students')) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground">You do not have permission to manage student records.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [isClassesLoading, setIsClassesLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      if (!user?.school?.id) return;
      try {
        const data = await SchoolService.getClasses(user.school.id);
        // Sort classes by level then stream
        const sortedData = [...data].sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return (a.stream || "").localeCompare(b.stream || "");
        });
        setClasses(sortedData);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setIsClassesLoading(false);
      }
    }
    fetchClasses();
  }, [user?.school?.id]);

  useEffect(() => {
    async function fetchStudent() {
      if (!id) return;
      try {
        const student = await StudentService.getStudent(id);
        if (student) {
          // Determine primary contact (Guardian > Father > Mother)
          const primaryContact = student.guardian || student.father || student.mother || {};
          const derivedGender = student.guardian?.gender || (student.father ? 'Male' : student.mother ? 'Female' : '');

          setFormData({
            registrationDate: student.registrationDate || '',
            enrolmentNumber: student.enrolmentNumber || '',
            classId: student.classId || '',
            firstName: student.firstName || '',
            surname: student.surname || '',
            otherNames: student.otherNames || '',
            nationalId: student.nationalId || '',
            examinationNumber: student.examinationNumber || '',
            dateOfBirth: student.dateOfBirth || '',
            gender: student.gender || '',
            residentialAddress: student.residentialAddress || '',
            email: student.email || '',
            currentLevel: student.currentLevel || 1,
            healthStatus: student.healthStatus || '',
            specialInformation: student.specialInformation || '',
            status: student.status as any || 'Active',
            isOrphan: !!student.isOrphan,
            hasDisability: !!student.hasDisability,
            isMarried: !!student.isMarried,

            // Map primary contact to guardian fields
            guardianFirstName: primaryContact.firstName || '',
            guardianSurname: primaryContact.surname || '',
            guardianOtherNames: primaryContact.otherNames || '',
            guardianGender: derivedGender,
            guardianResidentialAddress: primaryContact.residentialAddress || '',
            guardianOccupation: (primaryContact as any).occupation || '',
            guardianDateOfBirth: primaryContact.dateOfBirth || '',
            guardianContactNumber: primaryContact.contactNumber || '',
            guardianEmail: primaryContact.email || '',
            missingRecords: student.missingRecords || [],
          });
        }
      } catch (err) {
        console.error("Error fetching student:", err);
        toast({ title: "Error", description: "Failed to load student data", variant: "destructive" });
      }
    }
    fetchStudent();
  }, [id]);

  const [formData, setFormData] = useState({
    // Registration
    registrationDate: new Date().toISOString().split('T')[0],
    enrolmentNumber: '',
    classId: '',

    // Biographical
    firstName: '',
    surname: '',
    otherNames: '',
    nationalId: '',
    examinationNumber: '',
    dateOfBirth: '',
    gender: '' as 'Male' | 'Female' | '',
    residentialAddress: '',
    email: '',

    // Academic
    currentLevel: 1,
    healthStatus: '' as 'Good' | 'Fair' | 'Poor' | 'Special Needs' | '',
    specialInformation: '',

    // Status
    status: 'Active' as 'Active' | 'Inactive' | 'Transferred' | 'Graduated' | 'Expelled',
    isOrphan: false,
    hasDisability: false,
    isMarried: false,

    // Guardian
    guardianFirstName: '',
    guardianSurname: '',
    guardianOtherNames: '',
    guardianGender: '' as 'Male' | 'Female' | '',
    guardianResidentialAddress: '',
    guardianOccupation: '',
    guardianDateOfBirth: '',
    guardianContactNumber: '',
    guardianEmail: '',
    missingRecords: [] as string[],
    previousSchool: '', // Add previousSchool
  });

  const [birthCertificateFile, setBirthCertificateFile] = useState<File | null>(null);
  const [birthCertificateName, setBirthCertificateName] = useState<string | null>(null);

  const generateEnrolmentNumber = () => {
    const school = user?.school;
    if (!school) return '';

    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${school.centerNumber}/${year}/${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.school) {
        throw new Error('School information not available');
      }

      const enrolmentNumber = formData.enrolmentNumber || generateEnrolmentNumber();

      const newStudent: Student = {
        id: claimedStudentId || id || `student_${Date.now()}`,
        schoolId: user.school.id,
        registrationDate: formData.registrationDate,
        enrolmentNumber,
        firstName: formData.firstName,
        surname: formData.surname,
        otherNames: formData.otherNames || undefined,
        nationalId: formData.nationalId || undefined,
        examinationNumber: formData.examinationNumber || undefined,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'Male' | 'Female',
        residentialAddress: formData.residentialAddress,
        email: formData.email,
        classId: formData.classId || undefined,
        currentLevel: classes.find(c => c.id === formData.classId)?.level || 1,
        healthStatus: formData.healthStatus as 'Good' | 'Fair' | 'Poor' | 'Special Needs',
        academicPerformance: {},
        overallPerformance: 'Average',
        careerPathways: [],
        specialInformation: formData.specialInformation || undefined,
        status: formData.status,
        isOrphan: formData.isOrphan,
        hasDisability: formData.hasDisability,
        isMarried: formData.isMarried,
        missingRecords: formData.missingRecords,
        previousSchool: formData.previousSchool, // Ensure this is saved
      };

      // Attach birth certificate if uploaded
      if (birthCertificateFile && birthCertificateName) {
        // read file as base64 synchronously was already done when selecting; store reference from state
        // We'll read here to ensure data is available
        const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        try {
          const base64 = await toBase64(birthCertificateFile);
          (newStudent as any).birthCertificate = {
            name: birthCertificateName,
            mime: birthCertificateFile.type || 'application/pdf',
            data: base64
          };
        } catch (err) {
          // ignore and continue without certificate
        }
      }

      // Add/Update guardian information (Single Parent Model)
      if (formData.guardianFirstName && formData.guardianSurname) {
        newStudent.guardian = {
          firstName: formData.guardianFirstName,
          surname: formData.guardianSurname,
          otherNames: formData.guardianOtherNames || undefined,
          gender: formData.guardianGender as 'Male' | 'Female',
          residentialAddress: formData.guardianResidentialAddress,
          occupation: formData.guardianOccupation,
          dateOfBirth: formData.guardianDateOfBirth,
          contactNumber: formData.guardianContactNumber,
          email: formData.guardianEmail || undefined,
        };
        // Explicitly clear father/mother to enforce single source of truth for new edits
        newStudent.father = undefined;
        newStudent.mother = undefined;
      }

      await StudentService.saveStudent(newStudent);

      toast({
        title: "Student registered successfully",
        description: `${newStudent.firstName} ${newStudent.surname} has been added to the system.`,
      });

      // Navigate back to the students list using the current school slug
      // If slug is somehow missing from params, try to construct it from user data
      const targetSlug = schoolSlug ||
        (user.school?.slug) ||
        (user.school?.name ? user.school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'school');

      navigate(`/${targetSlug}/students`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration failed",
        description: "Failed to register student. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBirthCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'Invalid file', description: 'Only PDF files are accepted for birth certificates.', variant: 'destructive' });
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({ title: 'File too large', description: 'Birth certificate must be smaller than 5MB.', variant: 'destructive' });
      return;
    }
    setBirthCertificateFile(file);
    setBirthCertificateName(file.name);
    setBirthCertificateFile(file);
    setBirthCertificateName(file.name);
  };

  // National Pool Logic
  const [poolSearchOpen, setPoolSearchOpen] = useState(false);
  const [poolQuery, setPoolQuery] = useState("");
  const [poolResults, setPoolResults] = useState<Student[]>([]);
  const [isPoolSearching, setIsPoolSearching] = useState(false);

  const handlePoolSearch = async () => {
    if (!poolQuery.trim()) return;
    setIsPoolSearching(true);
    try {
      const results = await StudentService.searchNationalPool(poolQuery);
      setPoolResults(results);
    } catch (error) {
      console.error(error);
      toast({ title: "Search failed", description: "Could not search national pool", variant: "destructive" });
    } finally {
      setIsPoolSearching(false);
    }
  };

  const handleSelectPoolStudent = (student: Student) => {
    // Populate form with student data but keep new registration fields empty/default where appropriate
    setFormData(prev => ({
      ...prev,
      firstName: student.firstName,
      surname: student.surname,
      otherNames: student.otherNames || '',
      nationalId: student.nationalId || '',
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      residentialAddress: student.residentialAddress,
      email: student.email || '',
      healthStatus: (student.healthStatus as any) || '',
      previousSchool: student.previousSchool || '', // Preserve previous school info
      enrolmentNumber: student.enrolmentNumber || '', // Preserve original Enrolment Number

      // Guardian info
      guardianFirstName: student.guardian?.firstName || student.father?.firstName || '',
      guardianSurname: student.guardian?.surname || student.father?.surname || '',
      guardianOtherNames: student.guardian?.otherNames || '',
      guardianGender: (student.guardian?.gender || 'Female') as any,
      guardianContactNumber: student.guardian?.contactNumber || student.father?.contactNumber || '',
      guardianEmail: student.guardian?.email || '',
      guardianOccupation: (student.guardian as any)?.occupation || '',
      guardianResidentialAddress: student.guardian?.residentialAddress || '',

      // Status
      isOrphan: student.isOrphan,
      hasDisability: student.hasDisability,
      isMarried: student.isMarried,
    }));

    // We are essentially treating this as a new admission but "imported"
    // Ideally we might want to keep the same ID to track history? 
    // If we keep the ID, it's an UPDATE. If we generate new ID, it's a NEW record.
    // The requirement implies "Add from pool", so likely we are claiming the record.
    // Let's set the ID in the URL state or use a hidden field if we want to update the existing record.
    // For simplicity in this "Add" form, we'll just populate. However, to truly "move" them, we should update the existing ID.
    // But `id` param in this component controls "edit mode".
    // Let's redirect to edit mode for this student? Or just save the ID in a ref?
    // Better: Update the 'id' param in URL to switch to 'Edit' mode for this student?
    // No, that would trigger a fetch. Use a hidden state for "claimedStudentId".

    setClaimedStudentId(student.id);
    setPoolSearchOpen(false);
    toast({
      title: "Student Selected",
      description: "Form populated with student details from National Pool.",
    });
  };

  const [claimedStudentId, setClaimedStudentId] = useState<string | null>(null);

  // Modify submit to handle claimed student (Use existing ID)
  // We need to override the ID generation if claimedStudentId is set.


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-success rounded-2xl text-white">
            <UserPlus className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              {id ? 'Edit Student' : 'Add New Student'}
            </h1>
            <p className="text-muted-foreground">{id ? 'Update student record' : 'Register a new student in the system'}</p>
          </div>
        </div>
        {!id && (
          <Button variant="outline" onClick={() => setPoolSearchOpen(true)} className="gap-2">
            <Search className="h-4 w-4" />
            Add from National Pool
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Information */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic biographical and registration details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registrationDate">Registration Date</Label>
              <Input
                id="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={(e) => updateFormData('registrationDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrolmentNumber">Enrollment Number</Label>
              <Input
                id="enrolmentNumber"
                value={formData.enrolmentNumber}
                onChange={(e) => updateFormData('enrolmentNumber', e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => updateFormData('surname', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherNames">Other Names</Label>
              <Input
                id="otherNames"
                value={formData.otherNames}
                onChange={(e) => updateFormData('otherNames', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
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
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="residentialAddress">Residential Address *</Label>
              <Input
                id="residentialAddress"
                value={formData.residentialAddress}
                onChange={(e) => updateFormData('residentialAddress', e.target.value)}
                required
              />
            </div>
            <div className="space-y-4 md:col-span-2 border-t pt-4 mt-4">
              <Label className="text-base">Missing Documentation</Label>
              <CardDescription className="mb-2">Flag any documents that are currently missing from the student's file.</CardDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Birth Certificate', 'Medical Report', 'Transfer Letter', 'Previous Report Card', 'National ID'].map((doc) => (
                  <div key={doc} className="flex items-center space-x-2">
                    <Checkbox
                      id={`missing-${doc}`}
                      checked={formData.missingRecords.includes(doc)}
                      onCheckedChange={(checked) => {
                        const current = formData.missingRecords;
                        if (checked) {
                          updateFormData('missingRecords', [...current, doc]);
                        } else {
                          updateFormData('missingRecords', current.filter(d => d !== doc));
                        }
                      }}
                    />
                    <label htmlFor={`missing-${doc}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {doc}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="birthCertificate">Birth Certificate (PDF)</Label>
              <input
                id="birthCertificate"
                type="file"
                accept="application/pdf"
                onChange={handleBirthCertificateChange}
                className="w-full"
              />
              {birthCertificateName && (
                <div className="text-xs text-muted-foreground">Selected: {birthCertificateName}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Student's current academic status and performance</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="classId">Assigned Class *</Label>
              <Select
                value={formData.classId}
                onValueChange={(value) => updateFormData('classId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={isClassesLoading ? "Loading classes..." : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {isClassesLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Fetching registry...</span>
                    </div>
                  ) : classes.length > 0 ? (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No classes generated yet. Please setup your school structure in Settings.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status *</Label>
              <Select value={formData.healthStatus} onValueChange={(value) => updateFormData('healthStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Special Needs">Special Needs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="specialInformation">Special Information</Label>
              <Textarea
                id="specialInformation"
                value={formData.specialInformation}
                onChange={(e) => updateFormData('specialInformation', e.target.value)}
                placeholder="Any additional information about the student"
              />
            </div>
          </CardContent>
        </Card>



        {/* Parent / Guardian Information */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Parent / Guardian Details</CardTitle>
            <CardDescription>Primary contact information for the student's parent or guardian</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guardianFirstName">First Name</Label>
              <Input
                id="guardianFirstName"
                value={formData.guardianFirstName}
                onChange={(e) => updateFormData('guardianFirstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianSurname">Surname</Label>
              <Input
                id="guardianSurname"
                value={formData.guardianSurname}
                onChange={(e) => updateFormData('guardianSurname', e.target.value)}
              />
            </div>
            <Label htmlFor="guardianContactNumber">Contact Number</Label>
            <div className="flex gap-2">
              <Input
                id="guardianContactNumber"
                value={formData.guardianContactNumber}
                onChange={(e) => updateFormData('guardianContactNumber', e.target.value)}
                placeholder="e.g. 0971234567"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!formData.guardianContactNumber || formData.guardianContactNumber.length < 5) {
                    toast({ title: "Keep typing", description: "Enter a valid phone number to search.", variant: "default" });
                    return;
                  }
                  const loadingToast = toast({ title: "Searching...", description: "Looking for existing guardian..." });
                  try {
                    const guardian = await StudentService.findGuardianByPhone(formData.guardianContactNumber);
                    if (guardian) {
                      setFormData(prev => ({
                        ...prev,
                        guardianFirstName: guardian.firstName || guardian.name?.split(' ')[0] || '',
                        guardianSurname: guardian.surname || guardian.name?.split(' ').slice(1).join(' ') || '',
                        guardianOtherNames: guardian.otherNames || '',
                        guardianGender: guardian.gender || 'Female',
                        guardianEmail: guardian.email || '',
                        guardianOccupation: guardian.occupation || '',
                        guardianResidentialAddress: guardian.residentialAddress || guardian.address || '',
                        guardianDateOfBirth: guardian.dateOfBirth || ''
                      }));
                      toast({ title: "Guardian Found", description: "Guardian details populated successfully.", className: "bg-green-100 text-green-800" });
                    } else {
                      toast({ title: "Not Found", description: "No existing guardian found with this number.", variant: "default" });
                    }
                  } catch (e) {
                    toast({ title: "Error", description: "Search failed.", variant: "destructive" });
                  }
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianEmail">Email Address</Label>
              <Input
                id="guardianEmail"
                type="email"
                value={formData.guardianEmail}
                onChange={(e) => updateFormData('guardianEmail', e.target.value)}
                placeholder="For portal access"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianOccupation">Occupation</Label>
              <Input
                id="guardianOccupation"
                value={formData.guardianOccupation}
                onChange={(e) => updateFormData('guardianOccupation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianGender">Gender</Label>
              <Select value={formData.guardianGender} onValueChange={(value) => updateFormData('guardianGender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="guardianResidentialAddress">Residential Address</Label>
              <Input
                id="guardianResidentialAddress"
                value={formData.guardianResidentialAddress}
                onChange={(e) => updateFormData('guardianResidentialAddress', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Checkboxes */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Student Status</CardTitle>
            <CardDescription>Special circumstances and status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOrphan"
                checked={formData.isOrphan}
                onCheckedChange={(checked) => updateFormData('isOrphan', checked)}
              />
              <Label htmlFor="isOrphan">Student is an orphan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDisability"
                checked={formData.hasDisability}
                onCheckedChange={(checked) => updateFormData('hasDisability', checked)}
              />
              <Label htmlFor="hasDisability">Student has a disability</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMarried"
                checked={formData.isMarried}
                onCheckedChange={(checked) => updateFormData('isMarried', checked)}
              />
              <Label htmlFor="isMarried">Student is married</Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/students')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-success"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? (id ? 'Updating...' : 'Registering...') : (id ? 'Update Student' : 'Register Student')}
          </Button>
        </div>
      </form>

      {/* National Pool Search Modal */}
      <Dialog open={poolSearchOpen} onOpenChange={setPoolSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search National Pool</DialogTitle>
            <DialogDescription>
              Find a student who has been transferred to the national pool and admit them to your school.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or national ID..."
                value={poolQuery}
                onChange={(e) => setPoolQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePoolSearch()}
              />
              <Button onClick={handlePoolSearch} disabled={isPoolSearching}>
                {isPoolSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {poolResults.length === 0 && poolQuery.length > 2 && !isPoolSearching ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found in the national pool matching "{poolQuery}"
                </div>
              ) : (
                poolResults.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div>
                      <div className="font-medium">{student.firstName} {student.surname}</div>
                      <div className="text-sm text-muted-foreground">
                        DOB: {student.dateOfBirth} | Last School: {student.previousSchool || 'Unknown'}
                      </div>
                      {student.transferReason && (
                        <div className="text-xs text-amber-600 mt-1">Reason: {student.transferReason}</div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleSelectPoolStudent(student)}>
                      Select
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}