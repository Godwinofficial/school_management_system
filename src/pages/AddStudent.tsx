import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { StorageService, Student } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Save } from "lucide-react";

export default function AddStudent() {
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Registration
    registrationDate: new Date().toISOString().split('T')[0],
    enrolmentNumber: '',
    
    // Biographical
    firstName: '',
    surname: '',
    otherNames: '',
    nationalId: '',
    examinationNumber: '',
    dateOfBirth: '',
    gender: '' as 'Male' | 'Female' | '',
    residentialAddress: '',
    
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

      const studentId = `student_${Date.now()}`;
      const enrolmentNumber = formData.enrolmentNumber || generateEnrolmentNumber();

      const newStudent: Student = {
        id: studentId,
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
        currentLevel: formData.currentLevel,
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

      StorageService.saveStudent(newStudent);
      
      toast({
        title: "Student registered successfully",
        description: `${newStudent.firstName} ${newStudent.surname} has been added to the system.`,
      });

      navigate('/students');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Failed to register student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-primary to-success rounded-2xl text-white">
          <UserPlus className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Add New Student
          </h1>
          <p className="text-muted-foreground">Register a new student in the system</p>
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
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => updateFormData('nationalId', e.target.value)}
                placeholder="123456/78/9"
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
              <Label htmlFor="currentLevel">Current Level *</Label>
              <Select value={formData.currentLevel.toString()} onValueChange={(value) => updateFormData('currentLevel', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Level {i + 1}
                    </SelectItem>
                  ))}
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
                  <SelectValue placeholder="Select performance level" />
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
            {isLoading ? 'Registering...' : 'Register Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}