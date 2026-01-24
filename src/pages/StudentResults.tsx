import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { ArrowLeft, BookOpen, Award, TrendingUp, Calendar, AlertCircle, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Result {
    id: string;
    exam_id: string;
    subject: string;
    score: number;
    recorded_at: string;
}

interface TermResults {
    termId: string;
    termName: string;
    year: string;
    results: Result[];
    average: number;
    totalSubjects: number;
}

export default function StudentResults() {
    const [results, setResults] = useState<TermResults[]>([]);
    const [loading, setLoading] = useState(true);
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            fetchResults();
        }
    }, [user]);

    const fetchResults = async () => {
        try {
            const { data, error } = await supabase
                .from('results')
                .select('*')
                .eq('student_id', user?.id)
                .order('exam_id', { ascending: false });

            if (error) throw error;

            if (data) {
                // Group by exam_id (Term)
                const groups: Record<string, Result[]> = {};
                data.forEach(r => {
                    if (!groups[r.exam_id]) groups[r.exam_id] = [];
                    groups[r.exam_id].push(r);
                });

                const processed: TermResults[] = Object.keys(groups).map(termId => {
                    const termResults = groups[termId];
                    const totalScore = termResults.reduce((sum, r) => sum + r.score, 0);
                    const average = termResults.length > 0 ? totalScore / termResults.length : 0;

                    // Format term name (e.g., term_1_2024 -> Term 1 2024)
                    const parts = termId.split('_');
                    const termName = `Term ${parts[1]}`;
                    const year = parts[2] || new Date().getFullYear().toString();

                    return {
                        termId,
                        termName,
                        year,
                        results: termResults,
                        average,
                        totalSubjects: termResults.length
                    };
                }).sort((a, b) => {
                    // Sort by year desc, then term desc
                    if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
                    return b.termName.localeCompare(a.termName);
                });

                setResults(processed);
            }
        } catch (error) {
            // console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGrade = (score: number) => {
        if (score >= 75) return { grade: 'A', color: 'bg-green-500', label: 'Distinction' };
        if (score >= 60) return { grade: 'B', color: 'bg-blue-500', label: 'Merit' };
        if (score >= 50) return { grade: 'C', color: 'bg-yellow-500', label: 'Credit' };
        if (score >= 40) return { grade: 'D', color: 'bg-orange-500', label: 'Pass' };
        return { grade: 'F', color: 'bg-red-500', label: 'Fail' };
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return "text-green-600 font-bold";
        if (score >= 60) return "text-blue-600 font-semibold";
        if (score >= 50) return "text-yellow-600 font-medium";
        if (score >= 40) return "text-orange-600";
        return "text-red-600";
    }

    const downloadPDF = (term?: TermResults) => {
        if (!user) return;
        const doc = new jsPDF();

        // --- Header Section ---
        doc.setFillColor(41, 128, 185); // Blue header
        doc.rect(0, 0, 210, 50, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(user.school?.name || "School Name", 105, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Address line
        const addressParts = [];
        if (user.school?.ward) addressParts.push(user.school.ward);
        if (user.school?.district) addressParts.push(user.school.district);
        if (user.school?.province) addressParts.push(user.school.province);
        const address = addressParts.join(", ").toUpperCase();
        if (address) doc.text(address, 105, 22, { align: "center" });

        // Details line
        const meta = [];
        if (user.school?.centerNumber) meta.push(`Center Code: ${user.school.centerNumber}`);
        if (user.school?.type) meta.push(`Type: ${user.school.type}`);
        if (meta.length > 0) doc.text(meta.join("  |  "), 105, 28, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("OFFICIAL STATEMENT OF RESULTS", 105, 42, { align: "center" });

        // --- Student Details ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const detailsY = 65;
        doc.text(`Student Name: ${user.firstName} ${user.lastName}`, 15, detailsY);
        // doc.text(`Student ID: ${user.studentId || user.email}`, 15, detailsY + 6); 
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 15, detailsY + 6);

        // --- Content ---
        let currentY = detailsY + 25;

        // Filter results: either specific term or all
        const termsToPrint = term ? [term] : results;

        termsToPrint.forEach((t, index) => {
            // Term Header
            doc.setFillColor(240, 240, 240);
            doc.rect(15, currentY - 6, 180, 8, 'F');
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(`${t.termName} ${t.year} - Average: ${t.average.toFixed(1)}%`, 18, currentY);

            // Table Data
            const tableBody = t.results.map(r => {
                const grade = getGrade(r.score);
                return [r.subject, `${r.score}%`, grade.grade, grade.label];
            });

            autoTable(doc, {
                startY: currentY + 5,
                head: [['Subject', 'Score', 'Grade', 'Comment']],
                body: tableBody,
                theme: 'striped',
                headStyles: { fillColor: [44, 62, 80] },
                margin: { left: 15, right: 15 },
                didDrawPage: (data) => {
                    // Reset Y if page break
                    if (data.cursor) {
                        currentY = data.cursor.y;
                    }
                }
            });

            // @ts-ignore - access final Y position
            currentY = doc.lastAutoTable.finalY + 15;
        });

        // --- Footer ---
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("This document is electronically generated and is valid without a signature.", 105, 290, { align: "center" });
        }

        const fileName = term
            ? `${user.firstName}_${term.termName}_Results.pdf`
            : `${user.firstName}_Full_Transcript.pdf`;

        doc.save(fileName);
    };


    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200 hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4 text-slate-600" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Academic Results
                            </h1>
                            <p className="text-muted-foreground">Detailed breakdown of your performance history</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button onClick={() => downloadPDF()} className="hidden md:flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Transcript
                        </Button>

                        <Card className="bg-white border-none shadow-sm min-w-[200px]">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Overall Average</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        {results.length > 0
                                            ? (results.reduce((acc, curr) => acc + curr.average, 0) / results.length).toFixed(1)
                                            : '0.0'}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Results List */}
                {loading ? (
                    <div className="grid gap-6">
                        {[1, 2].map((i) => (
                            <Card key={i} className="animate-pulse shadow-sm border-none">
                                <CardHeader className="h-24 bg-slate-100 rounded-t-xl" />
                                <CardContent className="h-48 bg-white rounded-b-xl" />
                            </Card>
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <Card className="border-dashed border-2 bg-transparent shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                <AlertCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No Results Found</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                We couldn't find any academic records for you yet. Results will appear here once your teachers publish them.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-8">
                        {results.map((term) => (
                            <Card key={term.termId} className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-bold text-slate-900">
                                                    {term.termName} <span className="text-slate-400 font-medium ml-1">{term.year}</span>
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <span>{term.totalSubjects} Subjects</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>Average: <span className={getScoreColor(term.average)}>{term.average.toFixed(1)}%</span></span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => downloadPDF(term)} className="text-slate-500 hover:text-blue-600">
                                            <Printer className="h-4 w-4 mr-2" />
                                            Print
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50/50">
                                                <tr className="border-b border-slate-100">
                                                    <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase tracking-wider text-xs w-1/2">Subject</th>
                                                    <th className="h-10 px-4 text-center align-middle font-medium text-slate-500 uppercase tracking-wider text-xs">Score</th>
                                                    <th className="h-10 px-4 text-center align-middle font-medium text-slate-500 uppercase tracking-wider text-xs">Grade</th>
                                                    <th className="h-10 px-4 text-right align-middle font-medium text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {term.results.map((result) => {
                                                    const gradeInfo = getGrade(result.score);
                                                    return (
                                                        <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="p-4 px-6 align-middle">
                                                                <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{result.subject}</span>
                                                            </td>
                                                            <td className="p-4 align-middle text-center">
                                                                <span className={`text-base font-mono ${getScoreColor(result.score)}`}>{result.score}%</span>
                                                            </td>
                                                            <td className="p-4 align-middle text-center">
                                                                <Badge
                                                                    className={`${gradeInfo.color} text-white border-none shadow-none font-bold w-8 h-8 flex items-center justify-center mx-auto rounded-lg`}
                                                                >
                                                                    {gradeInfo.grade}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4 align-middle text-right">
                                                                <span className="text-slate-500 font-medium text-xs">{gradeInfo.label}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
