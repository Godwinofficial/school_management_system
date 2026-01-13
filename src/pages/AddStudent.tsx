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
import { UserPlus, Save, Loader2 } from "lucide-react";
import { SchoolService } from "@/lib/SchoolService";
import { useEffect } from "react";

export default function AddStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = AuthService.getCurrentUser();
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
            overallPerformance: student.overallPerformance || '',
            careerPathways: Array.isArray(student.careerPathways) ? student.careerPathways.join(', ') : '',
            specialInformation: student.specialInformation || '',
            status: student.status as any || 'Active',
            isOrphan: !!student.isOrphan,
            hasDisability: !!student.hasDisability,
            isMarried: !!student.isMarried,
            fatherFirstName: student.father?.firstName || '',
            fatherSurname: student.father?.surname || '',
            fatherOtherNames: student.father?.otherNames || '',
            fatherContactNumber: student.father?.contactNumber || '',
            fatherResidentialAddress: student.father?.residentialAddress || '',
            fatherNationality: student.father?.nationality || 'Zambian',
            fatherNationalId: student.father?.nationalId || '',
            fatherDateOfBirth: student.father?.dateOfBirth || '',
            fatherIsDeceased: !!student.father?.isDeceased,
            motherFirstName: student.mother?.firstName || '',
            motherSurname: student.mother?.surname || '',
            motherOtherNames: student.mother?.otherNames || '',
            motherContactNumber: student.mother?.contactNumber || '',
            motherResidentialAddress: student.mother?.residentialAddress || '',
            motherNationality: student.mother?.nationality || 'Zambian',
            motherNationalId: student.mother?.nationalId || '',
            motherDateOfBirth: student.mother?.dateOfBirth || '',
            motherIsDeceased: !!student.mother?.isDeceased,
            guardianFirstName: student.guardian?.firstName || '',
            guardianSurname: student.guardian?.surname || '',
            guardianOtherNames: student.guardian?.otherNames || '',
            guardianGender: student.guardian?.gender || '',
            guardianResidentialAddress: student.guardian?.residentialAddress || '',
            guardianOccupation: student.guardian?.occupation || '',
            guardianDateOfBirth: student.guardian?.dateOfBirth || '',
            guardianContactNumber: student.guardian?.contactNumber || '',
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
    overallPerformance: '' as 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor' | '',
    careerPathways: '',
    specialInformation: '',

    // Status
    status: 'Active' as 'Active',
    isOrphan: false,
    hasDisability: false,
    isMarried: false,

    // Father
    fatherFirstName: '',
    fatherSurname: '',
    fatherOtherNames: '',
    fatherContactNumber: '',
    fatherResidentialAddress: '',
    fatherNationality: 'Zambian',
    fatherNationalId: '',
    fatherDateOfBirth: '',
    fatherIsDeceased: false,

    // Mother
    motherFirstName: '',
    motherSurname: '',
    motherOtherNames: '',
    motherContactNumber: '',
    motherResidentialAddress: '',
    motherNationality: 'Zambian',
    motherNationalId: '',
    motherDateOfBirth: '',
    motherIsDeceased: false,

    // Guardian
    guardianFirstName: '',
    guardianSurname: '',
    guardianOtherNames: '',
    guardianGender: '' as 'Male' | 'Female' | '',
    guardianResidentialAddress: '',
    guardianOccupation: '',
    guardianDateOfBirth: '',
    guardianContactNumber: '',
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
        id: id || `student_${Date.now()}`,
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
        overallPerformance: formData.overallPerformance as 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor',
        careerPathways: formData.careerPathways ? formData.careerPathways.split(',').map(p => p.trim()) : [],
        specialInformation: formData.specialInformation || undefined,
        status: formData.status,
        isOrphan: formData.isOrphan,
        hasDisability: formData.hasDisability,
        isMarried: formData.isMarried,
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

      // Add father information
      if (formData.fatherFirstName && formData.fatherSurname) {
        newStudent.father = {
          firstName: formData.fatherFirstName,
          surname: formData.fatherSurname,
          otherNames: formData.fatherOtherNames || undefined,
          contactNumber: formData.fatherContactNumber || undefined,
          residentialAddress: formData.fatherResidentialAddress || undefined,
          nationality: formData.fatherNationality,
          nationalId: formData.fatherNationalId || undefined,
          dateOfBirth: formData.fatherDateOfBirth || undefined,
          isDeceased: formData.fatherIsDeceased,
        };
      }

      // Add mother information
      if (formData.motherFirstName && formData.motherSurname) {
        newStudent.mother = {
          firstName: formData.motherFirstName,
          surname: formData.motherSurname,
          otherNames: formData.motherOtherNames || undefined,
          contactNumber: formData.motherContactNumber || undefined,
          residentialAddress: formData.motherResidentialAddress || undefined,
          nationality: formData.motherNationality,
          nationalId: formData.motherNationalId || undefined,
          dateOfBirth: formData.motherDateOfBirth || undefined,
          isDeceased: formData.motherIsDeceased,
        };
      }

      // Add guardian information
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
        };
      }

      await StudentService.saveStudent(newStudent);

      toast({
        title: "Student registered successfully",
        description: `${newStudent.firstName} ${newStudent.surname} has been added to the system.`,
      });

      navigate('/students');
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
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
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
            <div className="space-y-2">
              <Label htmlFor="overallPerformance">Overall Performance</Label>
              <Select value={formData.overallPerformance} onValueChange={(value) => updateFormData('overallPerformance', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Below Average">Below Average</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="careerPathways">Career Pathways</Label>
              <Input
                id="careerPathways"
                value={formData.careerPathways}
                onChange={(e) => updateFormData('careerPathways', e.target.value)}
                placeholder="Engineering, Science, Arts (comma separated)"
              />
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
    </div>
  );
}