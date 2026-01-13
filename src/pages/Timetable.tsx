import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthService } from "@/lib/auth";
import { TimetableService, TimetableEntry } from "@/lib/TimetableService";
import { SchoolService } from "@/lib/SchoolService";
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Repeat, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Timetable() {
    const user = AuthService.getCurrentUser();
    const canManage = user?.role === 'head_teacher' || user?.role === 'deputy_head' || user?.role === 'senior_teacher';

    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);

    // Dropdown data
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        subject_id: '',
        teacher_id: '',
        class_id: '',
        room: '',
        day_of_week: '1', // Monday
        start_time: '08:00',
        end_time: '09:00',
        color: '#3b82f6'
    });

    const daysOfWeek = [
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' }
    ];

    useEffect(() => {
        if (user?.school?.id) {
            loadData();
        }
    }, [user?.school?.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const schoolId = user!.school!.id;

            // Fetch dropdown details if manager
            if (canManage) {
                const [classesList, teachersList, subjectsList] = await Promise.all([
                    SchoolService.getClasses(schoolId),
                    SchoolService.getTeachers(schoolId),
                    SchoolService.getSubjects(schoolId)
                ]);
                setClasses(classesList);
                setTeachers(teachersList);
                setSubjects(subjectsList);
            }

            // Fetch timetable entries based on role
            let filters: any = {};
            if (user?.role === 'class_teacher') {
                filters = { teacherId: user.id };
            } else if (user?.role === 'student' && user.classId) {
                filters = { classId: user.classId };
            }


            const data = await TimetableService.getTimetable(schoolId, filters);
            setEntries(data);
        } catch (error) {
            toast.error("Failed to load timetable data");
        } finally {
            setLoading(false);
        }
    };

    const getCalendarEvents = () => {
        return entries.map(entry => ({
            id: entry.id,
            title: `${entry.subject_name || entry.subject_id}\n${entry.teacher_name || entry.teacher_id}\n${entry.room}`,
            daysOfWeek: [entry.day_of_week],
            startTime: entry.start_time,
            endTime: entry.end_time,
            backgroundColor: entry.color,
            borderColor: entry.color,
            extendedProps: { ...entry }
        }));
    };

    const handleEventClick = (clickInfo: any) => {
        if (!canManage) return;

        const entry = entries.find(e => e.id === clickInfo.event.id);
        if (entry) {
            setSelectedEntry(entry);
            setFormData({
                subject_id: entry.subject_id,
                teacher_id: entry.teacher_id,
                class_id: entry.class_id,
                room: entry.room,
                day_of_week: entry.day_of_week.toString(),
                start_time: entry.start_time,
                end_time: entry.end_time,
                color: entry.color || '#3b82f6'
            });
            setIsDialogOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;

        try {
            const payload: any = {
                ...formData,
                day_of_week: parseInt(formData.day_of_week),
                school_id: user!.school!.id
            };

            if (selectedEntry) {
                payload.id = selectedEntry.id;
            }

            await TimetableService.saveEntry(payload, user!.id);
            toast.success(selectedEntry ? "Entry updated" : "Entry created");
            setIsDialogOpen(false);
            loadData();
            resetForm();
        } catch (error) {
            toast.error("Failed to save entry");
        }
    };

    const handleDelete = async () => {
        if (!canManage || !selectedEntry) return;

        try {
            await TimetableService.deleteEntry(selectedEntry.id, user!.school!.id, user!.id);
            toast.success("Entry deleted");
            setIsDialogOpen(false);
            loadData();
            resetForm();
        } catch (error) {
            toast.error("Failed to delete entry");
        }
    };

    const resetForm = () => {
        setFormData({
            subject_id: '',
            teacher_id: '',
            class_id: '',
            room: '',
            day_of_week: '1',
            start_time: '08:00',
            end_time: '09:00',
            color: '#3b82f6'
        });
        setSelectedEntry(null);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Repeat className="h-8 w-8 text-primary" />
                        Weekly Timetable
                    </h1>
                    <p className="text-muted-foreground">
                        {canManage ? 'Manage school-wide recurring timetable' :
                            user?.role === 'class_teacher' ? 'Your assigned class schedule' :
                                'Your weekly class schedule'}
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Session
                    </Button>
                )}
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Weekly Schedule
                    </CardTitle>
                    <CardDescription>
                        {canManage
                            ? 'Manage classes and teacher assignments effectively'
                            : 'View the official school schedule for this term'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="timetable-calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'timeGridWeek,timeGridDay'
                            }}
                            slotMinTime="07:00:00"
                            slotMaxTime="17:00:00"
                            allDaySlot={false}
                            editable={false}
                            weekends={false}
                            events={getCalendarEvents()}
                            eventClick={handleEventClick}
                            height="auto"
                            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedEntry ? 'Edit Session' : 'Add New Session'}</DialogTitle>
                        <DialogDescription>Fill in the details for the recurring weekly session</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select
                                value={formData.subject_id}
                                onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Teacher</Label>
                            <Select
                                value={formData.teacher_id}
                                onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Select
                                value={formData.class_id}
                                onValueChange={(v) => setFormData({ ...formData, class_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Room/Location</Label>
                            <Input
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                placeholder="e.g., Room 101"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Day of Week</Label>
                            <Select
                                value={formData.day_of_week}
                                onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {daysOfWeek.map(day => <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-4">
                            {selectedEntry && (
                                <Button type="button" variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                            )}
                            <Button type="submit">{selectedEntry ? 'Update Session' : 'Create Session'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <style>{`
                .timetable-calendar .fc-theme-standard td, .timetable-calendar .fc-theme-standard th { border-color: hsl(var(--border)); }
                .timetable-calendar .fc-button { background-color: hsl(var(--primary)); border-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
                .timetable-calendar .fc-event { cursor: pointer; border-radius: 6px; padding: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .timetable-calendar .fc-event-title { white-space: pre-line; font-size: 0.8em; font-weight: 500; }
            `}</style>
        </div>
    );
}

