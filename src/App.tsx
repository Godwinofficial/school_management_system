import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { useEffect, useState } from "react";

// Pages
import { LoginForm } from "@/components/LoginForm";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentPortal from "./pages/StudentPortal";
import StudentDetails from "./pages/StudentDetails";
import StudentResults from "./pages/StudentResults";
import TeacherDetails from "./pages/TeacherDetails";
import Teachers from "./pages/Teachers";
import AddTeacher from "./pages/AddTeacher";
import Classes from "./pages/Classes";
import AcademicRecords from "./pages/AcademicRecords";
import Reports from "./pages/Reports";
import Statistics from "./pages/Statistics";
import Schools from "./pages/Schools";
import SchoolDetails from "./pages/SchoolDetails";
import Planning from "./pages/Planning";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// New Pages
import DistrictStats from "./pages/DistrictStats";
import ProvincialStats from "./pages/ProvincialStats";
import NationalStats from "./pages/NationalStats";
import Curriculum from "./pages/Curriculum";
import Examinations from "./pages/Examinations";
import Districts from "./pages/Districts";
import Provinces from "./pages/Provinces";
import Subjects from "./pages/Subjects";
import ResultsEntry from "./pages/ResultsEntry";
import Attendance from "./pages/Attendance";
import Timetable from "./pages/Timetable";
import Finance from "./pages/Finance";
import ParentPortal from "./pages/ParentPortal";
import Messaging from "./pages/Messaging";
import ClassRegister from "./pages/ClassRegister";

// Admin Pages
import AdminSchools from "./pages/admin/AdminSchools";
import AdminSchoolDetails from "./pages/admin/AdminSchoolDetails";
import OnboardSchool from "./pages/admin/OnboardSchool";
import SubscriptionPlans from "./pages/admin/SubscriptionPlans";
import AdminUsers from "./pages/admin/AdminUsers";
import RoleTemplates from "./pages/admin/RoleTemplates";
import ActiveSubscriptions from "./pages/admin/ActiveSubscriptions";
import PaymentHistory from "./pages/admin/PaymentHistory";
import Invoices from "./pages/admin/Invoices";
import GlobalSettings from "./pages/admin/GlobalSettings";
import ModuleManagement from "./pages/admin/ModuleManagement";
import BackupsSecurity from "./pages/admin/BackupsSecurity";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import SupportTickets from "./pages/admin/SupportTickets";
import BulkImport from "./pages/admin/BulkImport";
import DataExport from "./pages/admin/DataExport";
import ActivityLogs from "./pages/admin/ActivityLogs";
import { seedDefaultSchool } from "@/lib/seed";

const queryClient = new QueryClient();

// Initialize sample data
StorageService.initializeSampleData();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const user = AuthService.getCurrentUser();
  const isStudent = user?.role === 'student';

  // Get dynamic header title based on user context
  const getHeaderTitle = () => {
    if (!user) return 'National Education Registry';

    if (user.school) {
      return user.school.name;
    }

    if (user.district && user.province) {
      return `${user.district} District Education Office`;
    }

    if (user.province) {
      return `${user.province} Provincial Education Office`;
    }

    if (user.role === 'super_admin') {
      return 'System Administration';
    }

    // National level roles
    const nationalRoles = ['permanent_secretary', 'director_examinations', 'director_curriculum',
      'director_planning', 'director_social_welfare', 'director_finance',
      'director_special_education'];
    if (nationalRoles.includes(user.role)) {
      return 'Ministry of Education - National Office';
    }

    return 'National Education Registry';
  };

  if (isStudent) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground">{getHeaderTitle()}</h1>
              {user?.school && (
                <p className="text-xs text-muted-foreground">
                  {user.school.type} School • {user.school.district}, {user.school.province}
                </p>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());



  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(AuthService.isAuthenticated());
    };

    // Listen for storage changes (for logout/login)
    window.addEventListener('storage', handleStorageChange);

    // Custom event for authentication changes
    window.addEventListener('authChange', handleStorageChange);

    // Auto-seed DB with default school if missing (Fix for FK errors)
    seedDefaultSchool();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                isAuthenticated ? (
                  // Helper IIFE to safely get slug
                  (() => {
                    const user = AuthService.getCurrentUser();
                    // Fallback slug generation if missing in user object but school exists
                    const schoolSlug = user?.school?.slug ||
                      (user?.school?.name ? user.school.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

                    if (user?.role === 'student') {
                      return <Navigate to={`/${schoolSlug || 'national'}/student`} />;
                    }
                    if (user?.role === 'guardian') {
                      return <Navigate to={`/${schoolSlug || 'national'}/parent`} />;
                    }
                    if (user?.role === 'subject_teacher') {
                      return <Navigate to={`/${schoolSlug}/teacher-dashboard`} />;
                    }
                    if (AuthService.getUserLevel() === 'school' && user?.school) {
                      return <Navigate to={`/${schoolSlug}/dashboard`} />;
                    }
                    return <Navigate to="/dashboard" />;
                  })()
                ) : (
                  <LoginForm />
                )
              } />

              <Route path="/login" element={<LoginForm />} />

              {/* Student Portal */}
              <Route path="/:schoolSlug/student" element={
                <ProtectedRoute requiredRoles="student">
                  <StudentPortal />
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/student/results" element={
                <ProtectedRoute requiredRoles={['student', 'guardian']}>
                  <StudentResults />
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/parent" element={
                <ProtectedRoute requiredRoles="guardian">
                  <ParentPortal />
                </ProtectedRoute>
              } />

              {/* Teacher Dash board */}
              <Route path="/:schoolSlug/teacher-dashboard" element={
                <ProtectedRoute requiredRoles="subject_teacher">
                  <AppLayout>
                    <TeacherDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Admin/Staff R outes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRoles={[
                  'district_education_director', 'district_standards_officer', 'district_education_officer',
                  'district_social_welfare_officer', 'district_planning_officer', 'district_career_officer',
                  'district_statistical_officer', 'district_accounts_officer', 'provincial_education_officer',
                  'provincial_standards_officer', 'provincial_social_welfare', 'provincial_planning_officer',
                  'provincial_career_officer', 'provincial_statistical_officer', 'provincial_accounts_officer',
                  'permanent_secretary', 'director_examinations', 'director_curriculum', 'director_planning',
                  'director_social_welfare', 'director_finance', 'director_special_education'
                ]}>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/dashboard" element={
                <ProtectedRoute requiredRoles={[
                  'head_teacher', 'deputy_head', 'career_guidance_teacher',
                  'social_welfare_teacher', 'school_accountant', 'boarding_teacher',
                  'district_education_director', 'district_standards_officer', 'district_education_officer',
                  'district_social_welfare_officer', 'district_planning_officer', 'district_career_officer',
                  'district_statistical_officer', 'district_accounts_officer', 'provincial_education_officer',
                  'provincial_standards_officer', 'provincial_social_welfare', 'provincial_planning_officer',
                  'provincial_career_officer', 'provincial_statistical_officer', 'provincial_accounts_officer',
                  'permanent_secretary', 'director_examinations', 'director_curriculum', 'director_planning',
                  'director_social_welfare', 'director_finance', 'director_special_education'
                ]}>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/students" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Students />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/students/add" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddStudent />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/students/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <StudentDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/students/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddStudent /> {/* Reusing AddStudent for Edit */}
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/academic-records" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AcademicRecords />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/reports" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/statistics" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Statistics />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/schools" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Schools />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/schools/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SchoolDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/planning" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Planning />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/settings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/teachers" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Teachers />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/teachers/add" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddTeacher />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/teachers/:id" element={
                <ProtectedRoute>
                  <AppLayout>
                    <TeacherDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/teachers/:id/edit" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AddTeacher />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/classes" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Classes />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/classes/:id/register" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ClassRegister />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* New R outes */}
              <Route path="/district-stats" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DistrictStats />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/provincial-stats" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProvincialStats />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/national-stats" element={
                <ProtectedRoute>
                  <AppLayout>
                    <NationalStats />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/curriculum" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Curriculum />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/subjects" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Subjects />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/results-entry" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ResultsEntry />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/examinations" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Examinations />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/districts" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Districts />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/provinces" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Provinces />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Attendance & Time table */}
              <Route path="/:schoolSlug/attendance" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Attendance />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/:schoolSlug/timetable" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Timetable />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Fi nance */}
              <Route path="/:schoolSlug/finance" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Finance />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Parent P ortal */}
              <Route path="/:schoolSlug/parent-portal" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ParentPortal />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Mess aging */}
              <Route path="/:schoolSlug/messaging" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Messaging />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Super Admin R outes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/schools" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <AdminSchools />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/schools/:id" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <AdminSchoolDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/schools/add" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <OnboardSchool />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/plans" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <SubscriptionPlans />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <AdminUsers />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/roles" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <RoleTemplates />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/subscriptions" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <ActiveSubscriptions />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/payments" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <PaymentHistory />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/invoices" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <Invoices />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <GlobalSettings />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/modules" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <ModuleManagement />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/security" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <BackupsSecurity />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/announcements" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <AdminAnnouncements />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/support" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <SupportTickets />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/import" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <BulkImport />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/export" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <DataExport />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/admin/logs" element={
                <ProtectedRoute requiredRoles={['super_admin']}>
                  <AppLayout>
                    <ActivityLogs />
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Catch-all  route */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
