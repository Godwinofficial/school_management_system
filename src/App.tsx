import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthService } from "@/lib/auth";
import { StorageService } from "@/lib/storage";
import { useEffect, useState } from "react";

// Pages
import { LoginForm } from "@/components/LoginForm";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentPortal from "./pages/StudentPortal";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import AcademicRecords from "./pages/AcademicRecords";
import Reports from "./pages/Reports";
import Statistics from "./pages/Statistics";
import Schools from "./pages/Schools";
import Planning from "./pages/Planning";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize sample data
StorageService.initializeSampleData();

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const user = AuthService.getCurrentUser();
  const isStudent = user?.role === 'student';

  if (isStudent) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-lg font-semibold">National Education Registry</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              isAuthenticated ? (
                AuthService.getCurrentUser()?.role === 'student' ? 
                  <Navigate to="/student" /> : 
                  <Navigate to="/dashboard" />
              ) : (
                <LoginForm />
              )
            } />
            
            {/* Student Portal */}
            <Route path="/student" element={
              <ProtectedRoute requiredRoles="student">
                <StudentPortal />
              </ProtectedRoute>
            } />

            {/* Admin/Staff Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute>
                <AppLayout>
                  <Students />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/students/add" element={
              <ProtectedRoute>
                <AppLayout>
                  <AddStudent />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/academic-records" element={
              <ProtectedRoute>
                <AppLayout>
                  <AcademicRecords />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/statistics" element={
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
            
            <Route path="/planning" element={
              <ProtectedRoute>
                <AppLayout>
                  <Planning />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/teachers" element={
              <ProtectedRoute>
                <AppLayout>
                  <Teachers />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/classes" element={
              <ProtectedRoute>
                <AppLayout>
                  <Classes />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
