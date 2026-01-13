import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AuthService } from "@/lib/auth";
import { StorageService, Student } from "@/lib/storage";
import { User, BookOpen, Award, Calendar, Home, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function StudentPortal() {
  const [student, setStudent] = useState<Student | null>(null);
  const user = AuthService.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user && user.role === 'student' && user.id) {
        try {
          const { StudentService } = await import("@/lib/StudentService");
          const studentRecord = await StudentService.getStudent(user.id);
          setStudent(studentRecord);
        } catch (error) {
          console.error("Failed to fetch student record:", error);
        }
      }
    };
    fetchStudentData();
  }, [user]);

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">This portal is only for students.</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Student Record Not Found</h1>
          <p className="text-muted-foreground">Your student record could not be located.</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const birthYear = new Date(student.dateOfBirth).getFullYear();
  const age = currentYear - birthYear;

  const getLatestPerformance = () => {
    if (!student?.academicPerformance) return null;
    const levels = Object.keys(student.academicPerformance).map(Number).sort((a, b) => b - a);
    return levels.length > 0 ? student.academicPerformance[levels[0]] : null;
  };

  const latestPerformance = getLatestPerformance();
  const totalSubjects = latestPerformance ? latestPerformance.A + latestPerformance.B + latestPerformance.C : 0;

  const generateReportCard = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('STUDENT REPORT CARD', 20, 20);

    // School Info
    doc.setFontSize(12);
    doc.text(`School: ${user.school?.name}`, 20, 35);
    doc.text(`Center Number: ${user.school?.centerNumber}`, 20, 45);
    doc.text(`Academic Year: ${new Date().getFullYear()}`, 20, 55);

    // Student Info
    doc.text(`Student: ${student.firstName} ${student.surname}`, 20, 70);
    doc.text(`ID: ${student.enrolmentNumber}`, 20, 80);
    doc.text(`Level: ${student.currentLevel}`, 20, 90);
    doc.text(`Gender: ${student.gender}`, 20, 100);

    // Performance
    if (latestPerformance) {
      doc.text('ACADEMIC PERFORMANCE:', 20, 120);
      doc.text(`A Grades: ${latestPerformance.A}`, 30, 135);
      doc.text(`B Grades: ${latestPerformance.B}`, 30, 145);
      doc.text(`C Grades: ${latestPerformance.C}`, 30, 155);
      doc.text(`Overall: ${student.overallPerformance}`, 30, 165);
    }

    // Career Pathways
    if (student.careerPathways && student.careerPathways.length > 0) {
      doc.text('CAREER PATHWAYS:', 20, 185);
      student.careerPathways.forEach((pathway, index) => {
        doc.text(`• ${pathway}`, 30, 195 + (index * 10));
      });
    }

    doc.save(`${student.firstName}_${student.surname}_Report_Card.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-success rounded-2xl text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Student Portal
              </h1>
              <p className="text-muted-foreground">Welcome back, {user.firstName}!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => generateReportCard()}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download Report Card
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                AuthService.logout();
                // Redirection is now handled by AuthService.logout()
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">Full Name:</span>
                <p className="text-sm text-muted-foreground">
                  {student.firstName} {student.otherNames || ''} {student.surname}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Age:</span>
                <p className="text-sm text-muted-foreground">{age} years old</p>
              </div>
              <div>
                <span className="text-sm font-medium">Gender:</span>
                <p className="text-sm text-muted-foreground">{student.gender}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Student ID:</span>
                <p className="text-sm text-muted-foreground font-mono">{student.enrolmentNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-success" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">School:</span>
                <p className="text-sm text-muted-foreground">{user.school?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Current Level:</span>
                <Badge variant="outline">Level {student.currentLevel}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Status:</span>
                <Badge className={
                  student.status === 'Active' ? 'bg-success text-success-foreground' :
                    'bg-muted text-muted-foreground'
                }>
                  {student.status}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Health Status:</span>
                <p className="text-sm text-muted-foreground">{student.healthStatus}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-warning" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">Overall Performance:</span>
                <Badge className={
                  student.overallPerformance === 'Excellent' ? 'bg-success text-success-foreground' :
                    student.overallPerformance === 'Good' ? 'bg-primary text-primary-foreground' :
                      student.overallPerformance === 'Average' ? 'bg-warning text-warning-foreground' :
                        'bg-muted text-muted-foreground'
                }>
                  {student.overallPerformance}
                </Badge>
              </div>
              {latestPerformance && (
                <>
                  <div>
                    <span className="text-sm font-medium">A Grades:</span>
                    <p className="text-sm text-muted-foreground">{latestPerformance.A} subjects</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">B Grades:</span>
                    <p className="text-sm text-muted-foreground">{latestPerformance.B} subjects</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">C Grades:</span>
                    <p className="text-sm text-muted-foreground">{latestPerformance.C} subjects</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Academic Progress */}
        {latestPerformance && (
          <Card className="border-0 shadow-soft mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Academic Progress - Level {student.currentLevel}
              </CardTitle>
              <CardDescription>
                Your current academic performance breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">A Grades</span>
                    <span className="text-sm text-muted-foreground">
                      {latestPerformance.A} / {totalSubjects}
                    </span>
                  </div>
                  <Progress
                    value={totalSubjects > 0 ? (latestPerformance.A / totalSubjects) * 100 : 0}
                    className="h-3"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">B Grades</span>
                    <span className="text-sm text-muted-foreground">
                      {latestPerformance.B} / {totalSubjects}
                    </span>
                  </div>
                  <Progress
                    value={totalSubjects > 0 ? (latestPerformance.B / totalSubjects) * 100 : 0}
                    className="h-3"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">C Grades</span>
                    <span className="text-sm text-muted-foreground">
                      {latestPerformance.C} / {totalSubjects}
                    </span>
                  </div>
                  <Progress
                    value={totalSubjects > 0 ? (latestPerformance.C / totalSubjects) * 100 : 0}
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Career Pathways */}
        {student.careerPathways && student.careerPathways.length > 0 && (
          <Card className="border-0 shadow-soft mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-success" />
                Career Pathways
              </CardTitle>
              <CardDescription>
                Recommended career paths based on your interests and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.careerPathways.map((pathway, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {pathway}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Information */}
        <div className="grid gap-6 md:grid-cols-2">
          {student.father && !student.father.isDeceased && (
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Father's Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Name:</span>
                  <p className="text-sm text-muted-foreground">
                    {student.father.firstName} {student.father.surname}
                  </p>
                </div>
                {student.father.contactNumber && (
                  <div>
                    <span className="text-sm font-medium">Contact:</span>
                    <p className="text-sm text-muted-foreground">{student.father.contactNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Nationality:</span>
                  <p className="text-sm text-muted-foreground">{student.father.nationality}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {student.mother && !student.mother.isDeceased && (
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Mother's Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Name:</span>
                  <p className="text-sm text-muted-foreground">
                    {student.mother.firstName} {student.mother.surname}
                  </p>
                </div>
                {student.mother.contactNumber && (
                  <div>
                    <span className="text-sm font-medium">Contact:</span>
                    <p className="text-sm text-muted-foreground">{student.mother.contactNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Nationality:</span>
                  <p className="text-sm text-muted-foreground">{student.mother.nationality}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {student.guardian && (
            <Card className="border-0 shadow-soft md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium">Name:</span>
                  <p className="text-sm text-muted-foreground">
                    {student.guardian.firstName} {student.guardian.surname}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Occupation:</span>
                  <p className="text-sm text-muted-foreground">{student.guardian.occupation}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Contact:</span>
                  <p className="text-sm text-muted-foreground">{student.guardian.contactNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Address:</span>
                  <p className="text-sm text-muted-foreground">{student.guardian.residentialAddress}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}