import { useEffect, useState } from "react";
import { Class, Student, School, StorageService, AttendanceRecord } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OfficialRegisterProps {
    classData?: Class;
    className?: string; // Add className prop
    classes?: Class[];
    students: Student[];
    school?: School | null;
    year?: number;
    term?: number | string;
    teacherName?: string;
}

export function OfficialRegister({
    classData,
    className,
    classes = [],
    students,
    school,
    year = new Date().getFullYear(),
    term = "1",
    teacherName = ""
}: OfficialRegisterProps) {
    const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Calculate term dates
    const getTermWeeks = () => {
        const weeks = [];
        let currentDate = new Date(year, 0, 1); // Start Jan 1

        // Find first Monday
        while (currentDate.getDay() !== 1) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Adjustment to start a bit later in Jan akin to real schools? 
        // Let's stick to first Monday of the year for generic "Week 1"
        // Or if Term 1 usually starts mid-Jan. Let's add 2 weeks.
        currentDate.setDate(currentDate.getDate() + 14);

        for (let i = 0; i < 13; i++) {
            weeks.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7);
        }
        return weeks;
    };

    const weeks = getTermWeeks();

    // Sort students by Class (if multiple) then Surname
    const sortedStudents = [...students].sort((a, b) => {
        // Get class names
        const classA = a.classId ? classes.find(c => c.id === a.classId)?.name || "" : "Unassigned";
        const classB = b.classId ? classes.find(c => c.id === b.classId)?.name || "" : "Unassigned";

        if (classA !== classB) {
            return classA.localeCompare(classB);
        }

        if (a.surname !== b.surname) {
            return a.surname.localeCompare(b.surname);
        }
        return a.firstName.localeCompare(b.firstName);
    });

    useEffect(() => {
        loadAttendance();
    }, [classData?.id, students]);

    const loadAttendance = () => {
        if (students.length === 0) return;

        // Use student IDs to fetch relevant records, supporting both Class and Grade views
        const studentIds = students.map(s => s.id);
        const records = StorageService.getAttendanceByStudents(studentIds);

        const map: Record<string, string> = {};
        records.forEach(r => {
            map[`${r.studentId}_${r.date}`] = r.status;
        });
        setAttendanceMap(map);
        setLoading(false);
    };


    // Improved cycle for real usage:
    // Click 1: Present (check)
    // Click 2: Absent (X)
    // Click 3: Clear (Remove) - Need to handle persistence
    // I'll stick to: Click -> Present. Right Click -> Absent? No, mobile friendly.
    // Cycle: Present -> Absent -> Late -> Present.
    // To 'Clear', we effectively need to delete from DB.
    // I'll just save it as "Present" -> "Absent" for now. 
    // And if they want to clear, maybe long press?
    // Let's just cycle Present -> Absent -> Late -> Present.

    // Helper for robust date keys (YYYY-MM-DD local)
    const getDateKey = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const handleCellClick = (studentId: string, date: Date) => {
        const dateStr = getDateKey(date);
        const key = `${studentId}_${dateStr}`;
        const current = attendanceMap[key];

        // Find the student to get accurate classId
        const student = students.find(s => s.id === studentId);
        const effectiveClassId = classData?.id || student?.classId;

        let next: AttendanceRecord['status'] | undefined = 'Present';

        if (current === 'Present') next = 'Absent';
        else if (current === 'Absent') next = 'Late';
        else if (current === 'Late') next = 'Sick';
        else if (current === 'Sick') next = 'Excused';
        else if (current === 'Excused') next = undefined; // Clear
        else if (current === undefined) next = 'Present';

        if (next) {
            const record: AttendanceRecord = {
                id: crypto.randomUUID(),
                studentId,
                classId: effectiveClassId,
                date: dateStr,
                status: next
            };
            StorageService.saveAttendance([record]);
        }

        // We update local state to reflect change immediately
        setAttendanceMap(prev => {
            const newMap = { ...prev };
            if (next) {
                newMap[key] = next;
            } else {
                delete newMap[key];
            }
            return newMap;
        });
    };

    const getMark = (status?: string) => {
        switch (status) {
            case 'Present': return <span className="text-green-600 font-bold">✓</span>;
            case 'Absent': return <span className="text-red-500 font-bold">a</span>; // or 'a' inside circle
            case 'Late': return <span className="text-yellow-600 font-bold">l</span>;
            case 'Sick': return <span className="text-orange-500 font-bold">s</span>;
            case 'Excused': return <span className="text-blue-500 font-bold">e</span>;
            default: return null;
        }
    };

    const getGuardianName = (student: Student) => {
        if (student.father && !student.father.isDeceased) return `${student.father.firstName} ${student.father.surname}`;
        if (student.mother && !student.mother.isDeceased) return `${student.mother.firstName} ${student.mother.surname}`;
        if (student.guardian) return `${student.guardian.firstName} ${student.guardian.surname}`;
        if (student.parentGuardian) return student.parentGuardian.name;
        return "";
    };

    const getContactNumber = (student: Student) => {
        if (student.father?.contactNumber) return student.father.contactNumber;
        if (student.mother?.contactNumber) return student.mother.contactNumber;
        if (student.guardian?.contactNumber) return student.guardian.contactNumber;
        if (student.parentGuardian?.phoneNumber) return student.parentGuardian.phoneNumber;
        if (student.emergencyContact?.phoneNumber) return student.emergencyContact.phoneNumber;
        return "";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    const getClassName = (student: Student) => {
        if (classData) return classData.name;
        if (student.classId) {
            const cls = classes.find(c => c.id === student.classId);
            return cls ? cls.name : student.classId;
        }
        return "";
    };

    // Calculate totals
    const getWeekTotals = (weekIndex: number) => {
        const weekStart = weeks[weekIndex];
        const days = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            days.push(getDateKey(d));
        }

        // Count for each day
        const boys = new Array(5).fill(0);
        const girls = new Array(5).fill(0);
        const total = new Array(5).fill(0);

        days.forEach((dayStr, dayIdx) => {
            students.forEach(s => {
                const status = attendanceMap[`${s.id}_${dayStr}`];
                if (status === 'Present' || status === 'Late') { // Usually Late counts as present for stats? Or separate. Let's count Present.
                    if (s.gender === 'Male') boys[dayIdx]++;
                    else girls[dayIdx]++;
                    total[dayIdx]++;
                }
            });
        });

        return { boys, girls, total };
    };

    // We need to pre-calc totals to render them in the footer efficiently
    // But rendering directly in the loop is easier.

    return (
        <div className="w-full bg-white text-xs font-sans overflow-x-auto select-none">
            {/* Printable Content Wrapper */}
            <div className="min-w-[1500px] p-4"> {/* Ensure minimum width for the grid */}

                {/* Header */}
                <div className="mb-2 text-center border-b-2 border-black pb-2">
                    <h1 className="text-xl font-bold uppercase tracking-wider mb-1">
                        {school?.name || "National Education Registry"}
                    </h1>
                    <h2 className="text-lg font-semibold uppercase mb-2">Official Attendance Register</h2>

                    <div className="flex justify-between items-end px-2 text-xs font-bold uppercase">
                        <div className="flex gap-4">
                            <p>CLASS: <span className="border-b border-black px-2 min-w-[150px] inline-block text-left">{classData?.name || className || ""}</span></p>
                            <p>TEACHER: <span className="border-b border-black px-2 min-w-[150px] inline-block text-left">{teacherName}</span></p>
                        </div>
                        <div className="flex gap-4">
                            <p>TERM: <span className="border-b border-black px-2 min-w-[30px] inline-block">{term}</span></p>
                            <p>YEAR: <span className="border-b border-black px-2">{year}</span></p>
                        </div>
                    </div>
                    {/* Key/Legend */}
                    <div className="flex gap-4 justify-center mt-2 text-[10px] text-gray-500 print:hidden">
                        <span>Key: <span className="text-green-600 font-bold">✓</span> Present</span>
                        <span><span className="text-red-500 font-bold">a</span> Absent</span>
                        <span><span className="text-yellow-600 font-bold">l</span> Late</span>
                        <span><span className="text-orange-500 font-bold">s</span> Sick</span>
                    </div>
                </div>

                {/* Register Table */}
                <div className="">
                    <table className="w-full border-collapse border border-black table-fixed">
                        <thead>
                            <tr className="bg-gray-100 print:bg-transparent text-[10px]">
                                <th className="border border-black p-0.5 w-[25px] align-bottom" rowSpan={3}>No.</th>
                                <th className="border border-black p-0.5 w-[140px] align-bottom" rowSpan={3}>Name of Pupil<br />(Surname First)</th>
                                <th className="border border-black p-0.5 w-[40px] align-bottom" rowSpan={3}>Class</th>
                                <th className="border border-black p-0.5 w-[100px] align-bottom" rowSpan={3}>Address</th>
                                <th className="border border-black p-0.5 w-[50px] align-bottom" rowSpan={3}>Date of<br />1st Entry<br />into School</th>
                                <th className="border border-black p-0.5 w-[25px] align-bottom" rowSpan={3}>Sex</th>
                                <th className="border border-black p-0.5 w-[50px] align-bottom" rowSpan={3}>Date of<br />Birth</th>
                                <th className="border border-black p-0.5 w-[100px] align-bottom" rowSpan={3}>Name of Father<br />or Guardian</th>
                                <th className="border border-black p-0.5 w-[70px] align-bottom" rowSpan={3}>Phone<br />Number</th>
                                {/* 13 Weeks Header */}
                                {[...Array(13)].map((_, i) => (
                                    <th key={i} className="border border-black p-0.5 text-center" colSpan={5}>
                                        Week {i + 1}
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-gray-100 print:bg-transparent text-[9px]">
                                {weeks.map((weekStart, i) => (
                                    <th key={`week-start-${i}`} colSpan={5} className="border border-black p-0 h-4 text-left pl-1 font-normal whitespace-nowrap overflow-hidden">
                                        Beg: {weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-gray-50 print:bg-transparent text-[9px]">
                                {[...Array(13)].map((_, w) => (
                                    ['M', 'T', 'W', 'T', 'F'].map((day, d) => (
                                        <th key={`${w}-${d}`} className="border border-black p-0 w-[20px] text-center font-normal">
                                            {day}
                                        </th>
                                    ))
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-[10px]">
                            {sortedStudents.map((student, index) => (
                                <tr key={student.id} className="h-6">
                                    <td className="border border-black p-0.5 text-center">{index + 1}</td>
                                    <td className="border border-black p-0.5 font-medium whitespace-nowrap overflow-hidden text-ellipsis px-1 text-left">
                                        {student.surname}, {student.firstName}
                                    </td>
                                    <td className="border border-black p-0.5 text-center">{getClassName(student)}</td>
                                    <td className="border border-black p-0.5 text-[9px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]" title={student.residentialAddress}>
                                        {student.residentialAddress}
                                    </td>
                                    <td className="border border-black p-0.5 text-center">{formatDate(student.registrationDate)}</td>
                                    <td className="border border-black p-0.5 text-center">
                                        {student.gender === 'Male' ? 'M' : 'F'}
                                    </td>
                                    <td className="border border-black p-0.5 text-center">{formatDate(student.dateOfBirth)}</td>
                                    <td className="border border-black p-0.5 text-[9px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                        {getGuardianName(student)}
                                    </td>
                                    <td className="border border-black p-0.5 text-[9px]">{getContactNumber(student)}</td>

                                    {/* Attendance Grid */}
                                    {weeks.map((weekStart, wIndex) => (
                                        // 5 days per week
                                        Array.from({ length: 5 }).map((_, dayIndex) => {
                                            const cellDate = new Date(weekStart);
                                            cellDate.setDate(cellDate.getDate() + dayIndex);
                                            const dateStr = getDateKey(cellDate);
                                            const status = attendanceMap[`${student.id}_${dateStr}`];

                                            return (
                                                <td
                                                    key={`${wIndex}-${dayIndex}`}
                                                    className={cn(
                                                        "border border-black p-0 text-center align-middle"
                                                    )}
                                                >
                                                    {/* Purely static content, no ticking */}
                                                </td>
                                            );
                                        })
                                    ))}
                                </tr>
                            ))}

                            {/* Empty rows to fill page */}
                            {[...Array(Math.max(0, 25 - students.length))].map((_, i) => (
                                <tr key={`empty-${i}`} className="h-6">
                                    <td className="border border-black p-0.5 text-center">{students.length + i + 1}</td>
                                    {[...Array(8)].map((_, j) => (
                                        <td key={j} className="border border-black p-0.5"></td>
                                    ))}
                                    {[...Array(65)].map((_, j) => (
                                        <td key={j} className="border border-black p-0"></td>
                                    ))}
                                </tr>
                            ))}

                            {/* Daily Totals Section */}
                            <tr className="h-6 font-bold bg-gray-50 print:bg-transparent">
                                <td colSpan={9} className="border border-black p-1 text-right pr-2">
                                    Number Present Daily: Boys
                                </td>
                                {weeks.map((weekStart, wIndex) => {
                                    // Empty cells for manual entry
                                    return Array.from({ length: 5 }).map((_, dIndex) => (
                                        <td key={`b-${wIndex}-${dIndex}`} className="border border-black p-0 text-center bg-white"></td>
                                    ));
                                })}
                            </tr>
                            <tr className="h-6 font-bold bg-gray-50 print:bg-transparent">
                                <td colSpan={9} className="border border-black p-1 text-right pr-2">
                                    Girls
                                </td>
                                {weeks.map((weekStart, wIndex) => {
                                    return Array.from({ length: 5 }).map((_, dIndex) => (
                                        <td key={`g-${wIndex}-${dIndex}`} className="border border-black p-0 text-center bg-white"></td>
                                    ));
                                })}
                            </tr>
                            <tr className="h-6 font-bold bg-gray-50 print:bg-transparent">
                                <td colSpan={9} className="border border-black p-1 text-right pr-2">
                                    Total
                                </td>
                                {weeks.map((weekStart, wIndex) => {
                                    return Array.from({ length: 5 }).map((_, dIndex) => (
                                        <td key={`t-${wIndex}-${dIndex}`} className="border border-black p-0 text-center bg-white"></td>
                                    ));
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer Signatures */}
                <div className="mt-4 grid grid-cols-2 gap-20 text-xs font-bold uppercase print:mt-8">
                    <div className="text-center">
                        <div className="border-t border-black pt-1 w-2/3 mx-auto">Class Teacher's Signature</div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-1 w-2/3 mx-auto">Head Teacher's Signature</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
