import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StorageService, Class, Student, School } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
import { Printer, ArrowLeft } from "lucide-react";

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
                // Sort students alphabetically
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
        <div className="min-h-screen bg-white p-8 print:p-0">
            {/* Navigation and Actions - Hidden when printing */}
            <div className="mb-8 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigate("/classes")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold">Class Register Preview</h1>
                </div>
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="mr-2 h-4 w-4" /> Print Register (A3)
                </Button>
            </div>

            {/* Printable Content */}
            <div className="mx-auto max-w-[1122px] print:max-w-none print:w-full">
                {/* Header */}
                <div className="mb-6 text-center border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">
                        {school?.name || "National Education Registry"}
                    </h1>
                    <h2 className="text-xl font-semibold uppercase mb-4">Class Attendance Register</h2>

                    <div className="flex justify-between items-end px-4 text-sm font-medium">
                        <div className="text-left space-y-1">
                            <p>CLASS: <span className="border-b border-black px-2 inline-block min-w-[100px]">{classData.name}</span></p>
                            <p>TEACHER: <span className="border-b border-black px-2 inline-block min-w-[150px]">_______________________</span></p>
                        </div>
                        <div className="text-right space-y-1">
                            <p>TERM: <span className="border-b border-black px-2 inline-block min-w-[50px]">___</span> YEAR: <span className="border-b border-black px-2 inline-block min-w-[60px]">{new Date().getFullYear()}</span></p>
                        </div>
                    </div>
                </div>

                {/* Register Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr className="bg-gray-100 print:bg-transparent">
                                <th className="border border-black p-1 w-8 text-center" rowSpan={2}>No.</th>
                                <th className="border border-black p-1 min-w-[200px] text-left" rowSpan={2}>Student Name</th>
                                <th className="border border-black p-1 w-8 text-center" rowSpan={2}>Sex</th>
                                <th className="border border-black p-1 text-center" colSpan={15}>Weeks</th>
                                <th className="border border-black p-1 min-w-[100px]" rowSpan={2}>Remarks</th>
                            </tr>
                            <tr className="bg-gray-50 print:bg-transparent">
                                {[...Array(15)].map((_, i) => (
                                    <th key={i} className="border border-black p-1 w-8 text-center text-[10px]">
                                        {i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id} className="break-inside-avoid">
                                    <td className="border border-black p-1 text-center">{index + 1}</td>
                                    <td className="border border-black p-1 font-medium">
                                        {student.surname}, {student.firstName} {student.otherNames}
                                    </td>
                                    <td className="border border-black p-1 text-center">
                                        {student.gender === 'Male' ? 'M' : 'F'}
                                    </td>
                                    {/* 15 Week Columns */}
                                    {[...Array(15)].map((_, i) => (
                                        <td key={i} className="border border-black p-1"></td>
                                    ))}
                                    <td className="border border-black p-1"></td>
                                </tr>
                            ))}
                            {/* Empty rows if class is small to fill page */}
                            {[...Array(Math.max(0, 30 - students.length))].map((_, i) => (
                                <tr key={`empty-${i}`} className="break-inside-avoid">
                                    <td className="border border-black p-1 text-center">{students.length + i + 1}</td>
                                    <td className="border border-black p-1"></td>
                                    <td className="border border-black p-1"></td>
                                    {[...Array(15)].map((_, j) => (
                                        <td key={j} className="border border-black p-1"></td>
                                    ))}
                                    <td className="border border-black p-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 grid grid-cols-3 gap-8 text-xs print:mt-12">
                    <div className="text-center">
                        <div className="border-t border-black pt-2">Class Teacher's Signature</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-2">Head Teacher's Signature</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-2">Date</div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          @page {
            size: A3 landscape;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          /* Hide everything else when printing if not already handled by layout */
          nav, aside, header:not(.print-header) {
            display: none !important;
          }
        }
      `}</style>
        </div>
    );
}
