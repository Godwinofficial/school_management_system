# PowerShell script to add import/export functionality to pages
# This script adds the necessary imports, state, handlers, and UI components

$ErrorActionPreference = "Stop"

Write-Host "Adding Import/Export functionality to pages..." -ForegroundColor Green

# Define the pages to update
$pages = @(
    @{
        File = "src\pages\Students.tsx"
        Type = "students"
        ExportHandler = @"
  const handleExportStudents = () => {
    return filteredStudents.map(s => ({
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
"@
        ImportHandler = @"
  const handleImportStudents = async (importedStudents: any[]) => {
    try {
      const newStudents = importedStudents.map(s => ({
        ...s,
        id: crypto.randomUUID(),
        schoolId: user?.school?.id || '',
        enrolmentNumber: s.studentId || ``ENR$${Date.now()}$${Math.random().toString(36).substr(2, 5).toUpperCase()}``,
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
        emergencyContact: { name: '', relationship: '', phoneNumber: '' },
        medicalInfo: {
          bloodGroup: '',
          allergies: s.medicalInfo || '',
          chronicConditions: '',
          medications: ''
        },
        documents: []
      }));

      newStudents.forEach(student => StorageService.saveStudent(student));
      
      const loadedStudents = StorageService.getStudents(
        userLevel === 'school' ? user?.school?.id : undefined
      );
      setStudents(loadedStudents);
      setFilteredStudents(loadedStudents);

      toast({
        title: "Import Successful",
        description: ``Successfully imported $${newStudents.length} student(s).``,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import students. Please try again.",
        variant: "destructive",
      });
    }
  };
"@
    }
)

foreach ($page in $pages) {
    $filePath = $page.File
    
    if (!(Test-Path $filePath)) {
        Write-Host "File not found: $filePath - Skipping" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing $filePath..." -ForegroundColor Cyan
    
    $content = Get-Content $filePath -Raw
    
    # Check if already has import/export
    if ($content -match "ImportExportDialog") {
        Write-Host "  Already has import/export - Skipping" -ForegroundColor Yellow
        continue
    }
    
    # Backup original file
    Copy-Item $filePath "$filePath.backup" -Force
    Write-Host "  Created backup: $filePath.backup" -ForegroundColor Gray
    
    # Add imports
    $content = $content -replace '(import.*from "lucide-react";)', '$1`nimport { Upload, Download } from "lucide-react";`nimport { ImportExportDialog } from "@/components/ImportExportDialog";`nimport { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";'
    
    # Add state variables after existing useState declarations
    $content = $content -replace '(const \[filteredStudents.*?\);)', '$1`n  const [importDialogOpen, setImportDialogOpen] = useState(false);`n  const [exportDialogOpen, setExportDialogOpen] = useState(false);'
    
    # Add handlers before return statement
    $importHandler = $page.ImportHandler
    $exportHandler = $page.ExportHandler
    $content = $content -replace '(const getPerformanceColor.*?\n  \};)', "`$1`n`n$importHandler`n`n$exportHandler`n`n  const canImportExport = user?.permissions?.includes('manage_students') || user?.role === 'head_teacher' || user?.role === 'senior_teacher';"
    
    # Add button in header
    $buttonCode = @"
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
"@
    
    $content = $content -replace '(<Button asChild className="bg-gradient-to-r from-primary to-success">)', "$buttonCode`n        `$1"
    
    # Add dialogs before closing div
    $dialogsCode = @"

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
"@
    
    $content = $content -replace '(    </div>\s*\);\s*})', "$dialogsCode`n`$1"
    
    # Save modified content
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "  ✓ Updated successfully" -ForegroundColor Green
}

Write-Host "`nDone! Import/Export functionality added." -ForegroundColor Green
Write-Host "Backup files created with .backup extension" -ForegroundColor Gray
