import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function ResultsEntry() {
  const { toast } = useToast();
  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [scores, setScores] = useState<Record<string,string>>({});

  useEffect(() => {
    (async () => {
      const { data: examsData } = await supabase.from('exams').select('*').order('date', { ascending: false });
      setExams(examsData || []);
      const { data: classesData } = await supabase.from('classes').select('*').order('level');
      setClasses(classesData || []);
    })();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return; }
    (async () => {
      const { data } = await supabase.from('students').select('*').eq('class_id', selectedClass).order('surname');
      setStudents(data || []);
      const map: Record<string,string> = {};
      (data || []).forEach((s:any) => { map[s.id] = ''; });
      setScores(map);
    })();
  }, [selectedClass]);

  const handleScoreChange = (studentId:string, value:string) => {
    setScores(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!selectedExam || !subject) { toast({ title: 'Missing', description: 'Select exam and subject', variant: 'destructive' }); return; }
    const toUpsert = Object.entries(scores)
      .filter(([,v]) => v !== '' && v !== null)
      .map(([student_id, score]) => ({
        student_id,
        exam_id: selectedExam,
        subject,
        score: Number(score)
      }));
    if (toUpsert.length === 0) { toast({ title: 'No data', description: 'No scores to save', variant: 'destructive' }); return; }
    const { error } = await supabase.from('results').upsert(toUpsert, { onConflict: ['student_id','exam_id','subject'] });
    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Saved', description: `${toUpsert.length} scores saved.` });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader><CardTitle>Results Entry</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>

              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — Grade {c.level}</SelectItem>)}</SelectContent>
              </Select>

              <Input placeholder="Subject (e.g., Mathematics)" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            <div>
              {students.length === 0 ? <div className="text-sm text-muted-foreground">No students loaded.</div> : (
                <div className="space-y-2">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center gap-4">
                      <div className="w-72">{s.surname} {s.first_name}</div>
                      <Input className="w-32" value={scores[s.id] ?? ''} onChange={(e) => handleScoreChange(s.id, e.target.value)} placeholder="Score" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Scores</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
