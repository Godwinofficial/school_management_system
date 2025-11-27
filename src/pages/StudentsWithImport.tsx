/**
 * EXAMPLE: How to Add Import/Export to Any Page
 * 
 * This file demonstrates how to integrate Excel import/export functionality
 * into your pages (Students, Classes, etc.)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { StorageService } from "@/lib/storage";
import { AuthService } from "@/lib/auth";

export default function ImportExportExample() {
    // 1. ADD THESE STATE VARIABLES
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);

    const user = AuthService.getCurrentUser();
    const userLevel = AuthService.getUserLevel();

    // 2. CREATE IMPORT HANDLER
    const handleImportStudents = async (importedStudents: any[]) => {
        try {
            // Convert imported data to your app's format
            const newStudents = importedStudents.map(s => ({
                ...s,
                id: crypto.randomUUID(),
                schoolId: user?.school?.id || '',
                enrolmentNumber: s.studentId || `ENR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                currentLevel: s.gradeLevel,
                surname: s.lastName,
                otherNames: '',
                status: 'Active' as const,
                overallPerformance: 'Average' as const,
                dateOfBirth: s.dateOfBirth,
                placeOfBirth: '',
                nationality: 'Zambian',
                religion: '',
                languageSpoken: '',
                previousSchool: '',
                dateOfAdmission: s.enrollmentDate || new Date().toISOString().split('T')[0],
                classId: '',
                parentGuardian: {
                    name: s.guardianName || '',
                    relationship: 'Parent',
                    phoneNumber: s.guardianPhone || '',
                    email: s.guardianEmail || '',
                    address: s.address || '',
                    occupation: ''
                },
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phoneNumber: ''
                },
                medicalInfo: {
                    bloodGroup: '',
                    allergies: s.medicalInfo || '',
                    chronicConditions: '',
                    medications: ''
                },
                documents: []
            }));

            // Save to storage
            newStudents.forEach(student => {
                StorageService.saveStudent(student);
            });

            // Reload data
            const loadedStudents = StorageService.getStudents(
                userLevel === 'school' ? user?.school?.id : undefined
            );
            setStudents(loadedStudents);

            toast({
                title: "Import Successful",
                description: `Successfully imported ${newStudents.length} student(s).`,
            });
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "Failed to import students. Please try again.",
                variant: "destructive",
            });
        }
    };

    // 3. CREATE EXPORT HANDLER
    const handleExportStudents = () => {
        // Convert your data to export format
        return students.map(s => ({
            studentId: s.enrolmentNumber,
            firstName: s.firstName,
            lastName: s.surname,
            dateOfBirth: s.dateOfBirth,
            gender: s.gender,
            gradeLevel: s.currentLevel,
            stream: '',
            guardianName: s.parentGuardian?.name || '',
            guardianPhone: s.parentGuardian?.phoneNumber || '',
            guardianEmail: s.parentGuardian?.email || '',
            address: s.parentGuardian?.address || '',
            medicalInfo: s.medicalInfo?.allergies || '',
            enrollmentDate: s.dateOfAdmission
        }));
    };

    // 4. CHECK PERMISSIONS
    const canImportExport = user?.permissions?.includes('manage_students') ||
        user?.role === 'head_teacher' ||
        user?.role === 'senior_teacher';

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Import/Export Example</h1>

                {/* 5. ADD THIS DROPDOWN MENU TO YOUR PAGE HEADER */}
                <div className="flex gap-2">
                    {canImportExport && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Import/Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import from Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export to Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border">
                <h2 className="font-semibold mb-4">How to Use Import/Export:</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li><strong>Download Template:</strong> Click "Import from Excel" and download the template</li>
                    <li><strong>Fill Template:</strong> Add your student data to the Excel template</li>
                    <li><strong>Upload File:</strong> Drag and drop or click to upload your filled template</li>
                    <li><strong>Review:</strong> Check the validation results and preview</li>
                    <li><strong>Import:</strong> Click "Import X Records" to add students to the system</li>
                    <li><strong>Export:</strong> Click "Export to Excel" to download current student data</li>
                </ol>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Excel Template Format:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Required Columns:</strong> First Name, Last Name, Date of Birth, Gender, Grade Level</p>
                    <p><strong>Optional Columns:</strong> Student ID, Stream, Guardian Name, Guardian Phone, Guardian Email, Address, Medical Info, Enrollment Date</p>
                    <p><strong>Date Format:</strong> YYYY-MM-DD (e.g., 2010-01-15)</p>
                    <p><strong>Gender:</strong> M/F or Male/Female</p>
                    <p><strong>Grade Level:</strong> 1-12</p>
                </div>
            </div>

            {/* 6. ADD THESE DIALOGS AT THE END OF YOUR COMPONENT */}
            <ImportExportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                mode="import"
                type="students"
                onImport={handleImportStudents}
            />

            <ImportExportDialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                mode="export"
                type="students"
                onExport={handleExportStudents}
            />
        </div>
    );
}

/**
 * QUICK INTEGRATION GUIDE:
 * 
 * To add import/export to Students.tsx:
 * 
 * 1. Add imports at the top:
 *    import { Upload, Download } from "lucide-react";
 *    import { ImportExportDialog } from "@/components/ImportExportDialog";
 *    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 * 
 * 2. Add state variables:
 *    const [importDialogOpen, setImportDialogOpen] = useState(false);
 *    const [exportDialogOpen, setExportDialogOpen] = useState(false);
 * 
 * 3. Add the handlers (handleImportStudents and handleExportStudents from above)
 * 
 * 4. Add permission check:
 *    const canImportExport = user?.permissions?.includes('manage_students') || user?.role === 'head_teacher' || user?.role === 'senior_teacher';
 * 
 * 5. Add the dropdown menu button next to "Add Student" button
 * 
 * 6. Add the two ImportExportDialog components at the end before closing </div>
 */
