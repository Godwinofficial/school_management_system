// Simple script to add import/export to Students.tsx
const fs = require('fs');

const filePath = 'src/pages/Students.tsx';

console.log('Reading Students.tsx...');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports after the existing lucide-react import
const luciImport = 'import { Search, UserPlus, Eye, Edit, Trash2 } from "lucide-react";';
const newLucidImport = 'import { Search, UserPlus, Eye, Edit, Trash2, Upload, Download } from "lucide-react";';
content = content.replace(luciImport, newLucidImport);

// Add new imports after Link import
const linkImport = 'import { Link } from "react-router-dom";';
const newImports = `import { Link } from "react-router-dom";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";`;
content = content.replace(linkImport, newImports);

// 2. Add state variables after filteredStudents
const stateDeclaration = '  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);';
const newStateDeclarations = `  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);`;
content = content.replace(stateDeclaration, newStateDeclarations);

// 3. Add handlers before return statement
const returnStatement = '  return (';
const handlers = `  const handleImportStudents = async (importedStudents: any[]) => {
    try {
      const newStudents = importedStudents.map(s => ({
        ...s,
        id: crypto.randomUUID(),
        schoolId: user?.school?.id || '',
        enrolmentNumber: s.studentId || \`ENR\${Date.now()}\${Math.random().toString(36).substr(2, 5).toUpperCase()}\`,
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
        description: \`Successfully imported \${newStudents.length} student(s).\`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import students. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const canImportExport = user?.permissions?.includes('manage_students') || user?.role === 'head_teacher' || user?.role === 'senior_teacher';

  return (`;
content = content.replace(returnStatement, handlers);

// 4. Add button in header
const addStudentButton = `        <Button asChild className="bg-gradient-to-r from-primary to-success">
          <Link to="/students/add">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>`;

const newHeaderButtons = `        <div className="flex gap-2">
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
          <Button asChild className="bg-gradient-to-r from-primary to-success">
            <Link to="/students/add">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </div>`;

content = content.replace(addStudentButton, newHeaderButtons);

// 5. Add dialogs before closing div
const closingDiv = '    </div>\n  );\n}';
const dialogsCode = `    </div>

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
}`;

content = content.replace(closingDiv, dialogsCode);

// Write the updated content
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Successfully added import/export to Students.tsx!');
console.log('The page now has Import/Export functionality.');
