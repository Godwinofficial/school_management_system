import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/lib/auth';
import { Loader2, Save, ArrowLeft, GraduationCap, BookOpen, User, Download } from 'lucide-react';
import { SchoolService } from '@/lib/SchoolService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as XLSX from 'xlsx';

type Step = 'classes' | 'subjects' | 'grading';

export default function ResultsEntry() {
  const { toast } = useToast();
  const user = AuthService.getCurrentUser();

  // Navigation State
  const [step, setStep] = useState<Step>('classes');

  // Data State
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Selection State
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Available Options State
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allSchoolSubjects, setAllSchoolSubjects] = useState<string[]>([]); // For Admins
  const [teacherClassSubjects, setTeacherClassSubjects] = useState<Record<string, string[]>>({}); // ClassID -> Subject[]

  // Grading State
  const [scores, setScores] = useState<Record<string, string>>({});
  const [maxScore, setMaxScore] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const initialFetchDone = useRef(false);

  // Initial Load
  useEffect(() => {
    if (!initialFetchDone.current && user?.id && user?.school?.id) {
      initialFetchDone.current = true;
      fetchInitialData();
    }
  }, [user?.id, user?.school?.id]);

  const fetchInitialData = async () => {
    if (!user?.school?.id) return;
    setIsLoading(true);
    try {
      // 1. Load Terms/Exams
      const currentYear = new Date().getFullYear();
      const termOptions = [
        { id: `term_1_${currentYear}`, name: `Term 1 ${currentYear}` },
        { id: `term_2_${currentYear}`, name: `Term 2 ${currentYear}` },
        { id: `term_3_${currentYear}`, name: `Term 3 ${currentYear}` },
      ];
      setExams(termOptions);
      setSelectedExam(termOptions[0].id); // Default to first term

      // 2. Load All School Subjects (Base List)
      const allSubjectsData = await SchoolService.getSubjects(user.school.id);
      let allSubjectNames = allSubjectsData.map(s => s.name);
      if (allSubjectNames.length === 0) {
        allSubjectNames = ['Mathematics', 'English', 'Science', 'Social Studies', 'CTS', 'Home Economics', 'Expressive Arts'];
      }
      setAllSchoolSubjects(allSubjectNames);

      // 3. Load Classes
      const allClasses = await SchoolService.getClasses(user.school.id);
      let visibleClasses = allClasses;

      // 4. Role-Based Filtering
      const teacherRoles = ['teacher', 'subject_teacher', 'senior_teacher', 'deputy_head']; // Include all potential teacher roles

      if (teacherRoles.includes(user.role)) {
        const classSubjectMap: Record<string, string[]> = {};
        let teacherId = user.id;

        // A. Get Teacher Profile for Assigned Classes & Generic Subjects
        // Try ID first
        let { data: teacherData } = await supabase
          .from('teachers')
          .select('id, assigned_class_ids, subjects')
          .eq('id', user.id)
          .single();

        // If not found by ID, try Email (auth ID vs table ID mismatch handling)
        if (!teacherData && user.email) {
          const { data: teacherByEmail } = await supabase
            .from('teachers')
            .select('id, assigned_class_ids, subjects')
            .eq('email', user.email)
            .single();

          if (teacherByEmail) {
            teacherData = teacherByEmail;
            teacherId = teacherByEmail.id; // Update ID for timetable query
          }
        }

        let genericTeacherSubjects: string[] = [];
        let assignedClassIds: string[] = [];

        if (teacherData) {
          genericTeacherSubjects = teacherData.subjects || [];
          assignedClassIds = teacherData.assigned_class_ids || [];
        }

        // B. Get Precise Timetable Data (Class <-> Subject mapping)
        const { data: timetableData } = await supabase
          .from('timetables')
          .select('class_id, subjects(name)')
          .eq('teacher_id', teacherId) // Use the resolved teacher ID
          .eq('school_id', user.school.id);

        const timetableClassIds = new Set<string>();

        if (timetableData) {
          timetableData.forEach((entry: any) => {
            const cId = entry.class_id;
            const sName = entry.subjects?.name;
            if (cId && sName) {
              timetableClassIds.add(cId);
              if (!classSubjectMap[cId]) classSubjectMap[cId] = [];
              if (!classSubjectMap[cId].includes(sName)) {
                classSubjectMap[cId].push(sName);
              }
            }
          });
        }

        // C. Merge explicit assignments with Timetable data
        assignedClassIds.forEach(cId => {
          if (!classSubjectMap[cId]) {
            classSubjectMap[cId] = [...genericTeacherSubjects];
          } else {
            if (classSubjectMap[cId].length === 0) {
              classSubjectMap[cId] = [...genericTeacherSubjects];
            }
          }
        });

        // Filter visible classes to only those relevant
        // Only filter if we actually found something. If mapping is empty, maybe fallback to all or warn?
        // Let's only filter if we found assigned classes. 
        const relevantClassIds = new Set([...assignedClassIds, ...timetableClassIds]);

        if (relevantClassIds.size > 0) {
          const filtered = allClasses.filter(c => relevantClassIds.has(c.id));
          if (filtered.length > 0) {
            visibleClasses = filtered;
          }
        }

        setTeacherClassSubjects(classSubjectMap);
      }

      // Sort classes
      visibleClasses.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
      });

      setClasses(visibleClasses);

    } catch (err) {
      console.error("Error loading initial data", err);
      toast({ title: "Error", description: "Failed to load classes or exams", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine subjects when class is selected
  const handleClassSelect = (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);

    // Determine available subjects
    const teacherRoles = ['teacher', 'subject_teacher', 'senior_teacher', 'deputy_head'];
    if (teacherRoles.includes(user?.role || '')) {
      const allowed = teacherClassSubjects[classId] || [];
      const subjectsToUse = allowed.length > 0 ? allowed : allSchoolSubjects;
      setSubjects(subjectsToUse);
    } else {
      // Admin sees all subjects
      setSubjects(allSchoolSubjects.length > 0 ? allSchoolSubjects : ['Mathematics', 'English', 'Science', 'Social Studies', 'CTS', 'Home Economics', 'Expressive Arts']);
    }

    setStep('subjects');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setStep('grading');
    setScores({}); // Clear previous scores
  };

  // Fetch students when in grading step
  useEffect(() => {
    if (step === 'grading' && selectedClassId) {
      fetchStudents();
      if (selectedExam && selectedSubject) {
        fetchExistingResults();
      }
    }
  }, [step, selectedClassId, selectedExam, selectedSubject]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, surname, enrolment_number')
        .eq('class_id', selectedClassId)
        .eq('status', 'Active')
        .order('surname');

      if (error) throw error;
      setStudents(data || []);

      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.id] = ''; });

      // Preserve existing scores if they were already loaded/entered
      setScores(prev => ({ ...map, ...prev }));

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('student_id, score')
        .eq('exam_id', selectedExam)
        .eq('subject', selectedSubject);

      if (data) {
        const newScores: Record<string, string> = {};
        data.forEach((r: any) => {
          newScores[r.student_id] = r.score.toString();
        });
        setScores(prev => ({ ...prev, ...newScores }));
      }
    } catch (e) {
      console.error("Error fetching existing results", e);
    }
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const num = parseFloat(value);
    if (value !== '' && (isNaN(num) || num < 0 || num > 100)) return;
    setScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedSubject) return;

    setIsSaving(true);
    const toUpsert = Object.entries(scores)
      .filter(([, v]) => v !== '' && v !== null)
      .map(([student_id, rawScore]) => {
        // Calculate percentage for storage to maintain compatibility
        // If maxScore is 100, rawScore is the percentage.
        // If maxScore is 50, and rawScore is 40, percentage is 80.
        const numScore = parseFloat(rawScore);
        const percentage = (numScore / maxScore) * 100;

        return {
          student_id,
          exam_id: selectedExam,
          subject: selectedSubject,
          score: Math.round(percentage * 100) / 100, // Save percentage rounded to 2 decimals
          recorded_at: new Date().toISOString(),
          recorded_by: user?.id
        };
      });

    if (toUpsert.length === 0) {
      toast({ title: 'No data', description: 'No scores entered to save.', variant: 'default' });
      setIsSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('results')
        .upsert(toUpsert, { onConflict: 'student_id, exam_id, subject' });

      if (error) throw error;
      toast({ title: 'Saved Successfully', description: `${toUpsert.length} student results saved.` });
    } catch (error: any) {
      toast({ title: 'Save Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const downloadResults = () => {
    // Create worksheet data
    const wsData = [
      ['Term', exams.find(e => e.id === selectedExam)?.name || selectedExam],
      ['Class', selectedClassName],
      ['Subject', selectedSubject],
      ['Total Marks', maxScore],
      [], // Empty row
      ['#', 'Enrolment Number', 'Student Name', 'Marks Obtained', 'Percentage (%)'], // Header
      ...students.map((s, idx) => {
        const rawVal = scores[s.id];
        const numVal = parseFloat(rawVal);
        let percentage = '-';

        if (!isNaN(numVal)) {
          percentage = ((numVal / maxScore) * 100).toFixed(1) + '%';
        }

        return [
          idx + 1,
          s.enrolment_number || '-',
          `${s.surname}, ${s.first_name}`,
          rawVal || '',
          percentage
        ];
      })
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // #
      { wch: 15 },  // Enrolment
      { wch: 30 },  // Name
      { wch: 15 },  // Marks
      { wch: 15 }   // Percentage
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    // Generate Excel file
    const safeName = `${selectedClassName}_${selectedSubject}_Values`.replace(/[^a-z0-9]/gi, '_');
    XLSX.writeFile(wb, `${safeName}.xlsx`);
  };

  // --- Render Steps ---

  const renderClassesStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Select a Class</h2>
          <p className="text-muted-foreground">Choose a class to enter grades for</p>
        </div>

        {/* Term Selector Always Visible */}
        <div className="w-64">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
            <SelectContent>
              {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map(cls => (
            <div
              key={cls.id}
              onClick={() => handleClassSelect(cls.id, cls.name)}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cls.name}</h3>
                  <p className="text-sm text-muted-foreground">Grade {cls.level} • {cls.stream || 'A'}</p>
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && <p className="text-muted-foreground col-span-full text-center py-10">No classes assigned to you.</p>}
        </div>
      )}
    </div>
  );

  const renderSubjectsStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setStep('classes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{selectedClassName} - Select Subject</h2>
          <p className="text-muted-foreground">Choose a subject to grade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subjects.map(subject => (
          <div
            key={subject}
            onClick={() => handleSubjectSelect(subject)}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{subject}</h3>
                <p className="text-sm text-muted-foreground">Click to enter grades</p>
              </div>
            </div>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-muted-foreground col-span-full text-center py-10">No subjects valid for this class.</p>}
      </div>
    </div>
  );

  const renderGradingStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStep('subjects')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{selectedClassName} • {selectedSubject}</h2>
            <p className="text-muted-foreground">Term: {exams.find(e => e.id === selectedExam)?.name || selectedExam}</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
            <span className="text-sm font-medium whitespace-nowrap">Total Marks:</span>
            <Input
              type="number"
              min="1"
              className="w-20 h-8 text-center"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value) || 100)}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving || students.length === 0} className="w-full md:w-auto">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Results
          </Button>
          <Button variant="outline" onClick={downloadResults} disabled={students.length === 0} title="Download Excel">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p>No active students found in this class.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">#</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">Enrolment #</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student Name</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[120px]">Marks Obtained</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground w-[100px]">Percentage</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {students.map((s, idx) => {
                    const rawVal = scores[s.id];
                    const numVal = parseFloat(rawVal);
                    let percentage = '-';
                    let rowClass = "";

                    if (!isNaN(numVal)) {
                      const calculated = (numVal / maxScore) * 100;
                      percentage = calculated.toFixed(1) + '%';
                      if (calculated < 40) rowClass = "text-red-500 bg-red-50/50";
                      else if (calculated >= 75) rowClass = "text-green-700 bg-green-50/50";
                    }

                    return (
                      <tr key={s.id} className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${rowClass}`}>
                        <td className="p-4 align-middle text-muted-foreground">{idx + 1}</td>
                        <td className="p-4 align-middle font-mono text-xs">{s.enrolment_number || '-'}</td>
                        <td className="p-4 align-middle font-medium">{s.surname}, {s.first_name}</td>
                        <td className="p-4 align-middle text-center">
                          <Input
                            type="number"
                            min="0"
                            max={maxScore}
                            className="h-10 w-24 border-primary/20 focus:border-primary font-mono text-center mx-auto"
                            placeholder="--"
                            value={scores[s.id] ?? ''}
                            onChange={(e) => handleScoreChange(s.id, e.target.value)}
                          />
                        </td>
                        <td className="p-4 align-middle text-center font-bold font-mono">
                          {percentage}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <p className="text-sm text-muted-foreground">{students.length} students loaded</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Results Entry</h1>
        <p className="text-muted-foreground hidden md:block">Record student performance efficiently.</p>
      </div>

      {step === 'classes' && renderClassesStep()}
      {step === 'subjects' && renderSubjectsStep()}
      {step === 'grading' && renderGradingStep()}
    </div>
  );
}
