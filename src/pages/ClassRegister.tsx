import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StorageService, Class, Student, School } from "@/lib/storage";
import { Printer, ArrowLeft } from "lucide-react";
import { OfficialRegister } from "@/components/OfficialRegister";

export default function ClassRegister() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<Class | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const cls = StorageService.getClass(id);
            if (cls) {
                setClassData(cls);
                const allStudents = StorageService.getStudents(cls.schoolId);
                const classStudents = allStudents.filter(s => s.classId === id);
                // Sort students alphabetically by surname
                classStudents.sort((a, b) => a.surname.localeCompare(b.surname) || a.firstName.localeCompare(b.firstName));
                setStudents(classStudents);

                const sch = StorageService.getSchool(cls.schoolId);
                setSchool(sch);
            }
        }
        setLoading(false);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="p-8 text-center">Loading register...</div>;
    }

    if (!classData) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600">Class not found</h2>
                <Button onClick={() => navigate("/classes")} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4 print:p-0 font-sans text-xs">
            {/* Navigation and Actions - Hidden when printing */}
            <div className="mb-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold">Class Register Preview</h1>
                </div>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="mr-2 h-4 w-4" /> Print Register (A3)
                </Button>
            </div>

            {/* Printable Content */}
            <div className="mx-auto w-full max-w-[1500px] print:max-w-none">
                <OfficialRegister
                    classData={classData}
                    students={students}
                    school={school}
                />
            </div>

            {/* Print Styles */}
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
                  /* Hide everything that is not the register */
                  nav, aside, header, button, .print-hidden {
                    display: none !important;
                  }
                  
                  /* Force exact sizing for the register */
                  .min-w-\\[1500px\\] {
                    min-width: 0 !important;
                    width: 100% !important;
                  }
                  
                  /* Ensure background colors print */
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
            `}</style>
        </div>
    );
}
