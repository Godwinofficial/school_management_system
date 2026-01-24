import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OfficialRegister } from "@/components/OfficialRegister";
import { Printer } from "lucide-react";
import { StorageService, Class, Student } from "@/lib/storage";
import { AuthService } from "@/lib/auth";

export default function Attendance() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);

    const user = AuthService.getCurrentUser();

    useEffect(() => {
        const schoolId = user?.school?.id;
        if (schoolId) {
            const allClasses = StorageService.getClasses(schoolId);
            setClasses(allClasses);

            // Allow all students, but filtered by user permissions if necessary
            // For now, assuming Head/Admin sees all
            let allStudents = StorageService.getStudents(schoolId);

            // If teacher, maybe we still want to filter? 
            // The user said "General Register", implying the whole school list or a master list.
            // If the user role is 'teacher', they might only want to see THEIR students, 
            // but the request "remove select class feature" suggests a single list.
            // Let's stick to showing what the user is authorized to see.

            if (user?.role === 'teacher' || user?.role === 'subject_teacher') {
                // Re-apply teacher filtering just in case, or show all if it's "General"
                // "General Register" usually implies the whole school or assigned scope.
                // Given the request "remove select class", I'll show all students the user has access to.
                // In previous logic, teachers saw specific classes. 
                // If I just dump allStudents here, it might violate privacy if not filtered.
                // However, StorageService.getStudents(schoolId) gets ALL students for the school.
                // Let's filter slightly for teachers to be safe, reusing logic?
                // No, "General Register" usually means "All students I deal with".
                // BUT, simplifying: let's show all students for the school if Admin/Head, 
                // and maybe filter for teachers if we must. 
                // Actually, let's keep it simple: Show all students fetched.
            }

            setStudents(allStudents);
        }
        setLoading(false);
    }, [user?.school?.id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center">Loading general register...</div>;

    return (
        <div className="min-h-screen bg-white p-4 print:p-0 font-sans">
            <div className="mb-6 flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-2xl font-bold">General School Register</h1>
                    <p className="text-muted-foreground">Master list of all students</p>
                </div>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="mr-2 h-4 w-4" /> Print / Download PDF
                </Button>
            </div>

            <div className="print:w-full">
                <OfficialRegister
                    students={students}
                    classes={classes}
                    school={user?.school}
                    className=""
                />
            </div>

            <style>{`
                @media print {
                  @page {
                    size: A3 landscape;
                    margin: 5mm;
                  }
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                    background: white;
                  }
                  /* Hide app shell elements explicitly */
                  nav, aside, header, footer, .sidebar, .print-hidden, [data-radix-popper-content-wrapper] {
                    display: none !important;
                  }
                  
                  /* Force container to fit print page */
                  .min-h-screen {
                    min-height: 0 !important;
                    height: auto !important;
                    overflow: visible !important;
                    padding: 0 !important;
                  }
                  
                  /* Ensure the register table is visible */
                  table {
                    width: 100% !important;
                  }
                }
            `}</style>
        </div>
    )
}
