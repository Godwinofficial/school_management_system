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
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface TimetableEntry {
    id: string;
    title: string;
    subject: string;
    teacher: string;
    room: string;
    dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
    startTime: string; // HH:mm format
    endTime: string;
    color?: string;
    recurring: boolean; // Always true for weekly timetable
}

export default function Timetable() {
    const user = AuthService.getCurrentUser();
    const canManage = user?.role === 'head_teacher' || user?.role === 'deputy_head' || user?.role === 'senior_teacher';

    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
    const [formData, setFormData] = useState({
        subject: '',
        teacher: '',
        room: '',
        dayOfWeek: '1', // Monday
        startTime: '08:00',
        endTime: '09:00',
        color: '#3b82f6'
    });

    const daysOfWeek = [
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' }
    ];

    // Load timetable from localStorage
    useEffect(() => {
        const savedTimetable = localStorage.getItem('school_timetable_recurring');
        if (savedTimetable) {
            setEntries(JSON.parse(savedTimetable));
        } else {
            // Sample recurring timetable data
            const sampleEntries: TimetableEntry[] = [
                {
                    id: '1',
                    title: 'Mathematics',
                    subject: 'Mathematics',
                    teacher: 'Mr. Mwanza',
                    room: 'Room 101',
                    dayOfWeek: 1, // Monday
                    startTime: '08:00',
                    endTime: '09:00',
                    color: '#3b82f6',
                    recurring: true
                },
                {
                    id: '2',
                    title: 'English',
                    subject: 'English',
                    teacher: 'Mrs. Banda',
                    room: 'Room 102',
                    dayOfWeek: 1, // Monday
                    startTime: '09:00',
                    endTime: '10:00',
                    color: '#10b981',
                    recurring: true
                },
                {
                    id: '3',
                    title: 'Science',
                    subject: 'Science',
                    teacher: 'Mr. Phiri',
                    room: 'Lab 1',
                    dayOfWeek: 2, // Tuesday
                    startTime: '08:00',
                    endTime: '09:00',
                    color: '#f59e0b',
                    recurring: true
                },
                {
                    id: '4',
                    title: 'Physical Education',
                    subject: 'Physical Education',
                    teacher: 'Mr. Zulu',
                    room: 'Sports Field',
                    dayOfWeek: 3, // Wednesday
                    startTime: '14:00',
                    endTime: '15:00',
                    color: '#ef4444',
                    recurring: true
                },
                {
                    id: '5',
                    title: 'History',
                    subject: 'History',
                    teacher: 'Mrs. Mulenga',
                    room: 'Room 103',
                    dayOfWeek: 4, // Thursday
                    startTime: '10:00',
                    endTime: '11:00',
                    color: '#8b5cf6',
                    recurring: true
                }
            ];
            setEntries(sampleEntries);
            localStorage.setItem('school_timetable_recurring', JSON.stringify(sampleEntries));
        }
    }, []);

    // Convert recurring entries to FullCalendar events
    const getCalendarEvents = () => {
        return entries.map(entry => ({
            id: entry.id,
            title: `${entry.subject}\n${entry.teacher}\n${entry.room}`,
            daysOfWeek: [entry.dayOfWeek],
            startTime: entry.startTime,
            endTime: entry.endTime,
            backgroundColor: entry.color,
            borderColor: entry.color,
            extendedProps: {
                subject: entry.subject,
                teacher: entry.teacher,
                room: entry.room
            }
        }));
    };

    // Save timetable to localStorage
    const saveTimetable = (updatedEntries: TimetableEntry[]) => {
        localStorage.setItem('school_timetable_recurring', JSON.stringify(updatedEntries));
        setEntries(updatedEntries);
    };

    const handleEventClick = (clickInfo: any) => {
        const entry = entries.find(e => e.id === clickInfo.event.id);
        if (entry) {
            setSelectedEntry(entry);
            setFormData({
                subject: entry.subject,
                teacher: entry.teacher,
                room: entry.room,
                dayOfWeek: entry.dayOfWeek.toString(),
                startTime: entry.startTime,
                endTime: entry.endTime,
                color: entry.color || '#3b82f6'
            });
            setIsDialogOpen(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!canManage) {
            toast.error("You don't have permission to modify timetable");
            return;
        }

        if (selectedEntry) {
            // Update existing entry
            const updatedEntries = entries.map(entry =>
                entry.id === selectedEntry.id
                    ? {
                        ...entry,
                        title: formData.subject,
                        subject: formData.subject,
                        teacher: formData.teacher,
                        room: formData.room,
                        dayOfWeek: parseInt(formData.dayOfWeek),
                        startTime: formData.startTime,
                        endTime: formData.endTime,
                        color: formData.color
                    }
                    : entry
            );
            saveTimetable(updatedEntries);
            toast.success("Timetable entry updated successfully");
        } else {
            // Create new entry
            const newEntry: TimetableEntry = {
                id: Date.now().toString(),
                title: formData.subject,
                subject: formData.subject,
                teacher: formData.teacher,
                room: formData.room,
                dayOfWeek: parseInt(formData.dayOfWeek),
                startTime: formData.startTime,
                endTime: formData.endTime,
                color: formData.color,
                recurring: true
            };
            saveTimetable([...entries, newEntry]);
            toast.success("Timetable entry created successfully");
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleDelete = () => {
        if (!canManage || !selectedEntry) return;

        const updatedEntries = entries.filter(entry => entry.id !== selectedEntry.id);
        saveTimetable(updatedEntries);
        toast.success("Timetable entry deleted successfully");
        setIsDialogOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            subject: '',
            teacher: '',
            room: '',
            dayOfWeek: '1',
            startTime: '08:00',
            endTime: '09:00',
            color: '#3b82f6'
        });
        setSelectedEntry(null);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Repeat className="h-8 w-8" />
                        Weekly Timetable
                    </h1>
                    <p className="text-muted-foreground">
                        {canManage ? 'Manage the recurring weekly school timetable' : 'View the weekly school timetable'}
                    </p>
                </div>
                {canManage && (
                    <Button onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                    </Button>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Repeat className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Recurring Weekly Schedule</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            This timetable repeats every week. Classes scheduled for Monday will occur every Monday,
                            Tuesday classes every Tuesday, and so on throughout the school year.
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Weekly Class Schedule
                    </CardTitle>
                    <CardDescription>
                        {canManage
                            ? 'Click on an existing class to edit it, or use the "Add Class" button to create a new one'
                            : 'View all scheduled classes for the week'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            selectable={false}
                            dayMaxEvents={true}
                            weekends={false}
                            events={getCalendarEvents()}
                            eventClick={handleEventClick}
                            height="auto"
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }}
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEntry ? (
                                <>
                                    <Edit className="h-5 w-5" />
                                    Edit Class
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Add New Class
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {canManage
                                ? 'This class will repeat every week on the selected day'
                                : 'You can only view timetable entries'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="e.g., Mathematics"
                                required
                                disabled={!canManage}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teacher">Teacher *</Label>
                            <Input
                                id="teacher"
                                value={formData.teacher}
                                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                                placeholder="e.g., Mr. Mwanza"
                                required
                                disabled={!canManage}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="room">Room/Location *</Label>
                            <Input
                                id="room"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                placeholder="e.g., Room 101"
                                required
                                disabled={!canManage}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dayOfWeek">Day of Week *</Label>
                            <Select
                                value={formData.dayOfWeek}
                                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                                disabled={!canManage}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {daysOfWeek.map(day => (
                                        <SelectItem key={day.value} value={day.value}>
                                            {day.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time *</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                    disabled={!canManage}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time *</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                    disabled={!canManage}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-20 h-10"
                                    disabled={!canManage}
                                />
                                <Input
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="#3b82f6"
                                    disabled={!canManage}
                                />
                            </div>
                        </div>

                        {canManage && (
                            <DialogFooter className="gap-2">
                                {selectedEntry && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                )}
                                <Button type="submit">
                                    {selectedEntry ? (
                                        <>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Update
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        )}
                    </form>
                </DialogContent>
            </Dialog>

            <style>{`
        .timetable-calendar .fc {
          font-family: inherit;
        }
        .timetable-calendar .fc-theme-standard td,
        .timetable-calendar .fc-theme-standard th {
          border-color: hsl(var(--border));
        }
        .timetable-calendar .fc-button {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .timetable-calendar .fc-button:hover {
          background-color: hsl(var(--primary) / 0.9);
        }
        .timetable-calendar .fc-button-active {
          background-color: hsl(var(--primary) / 0.8);
        }
        .timetable-calendar .fc-col-header-cell {
          background-color: hsl(var(--muted));
          font-weight: 600;
        }
        .timetable-calendar .fc-timegrid-slot {
          height: 3em;
        }
        .timetable-calendar .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
        }
        .timetable-calendar .fc-event:hover {
          opacity: 0.9;
        }
        .timetable-calendar .fc-event-title {
          white-space: pre-line;
          font-size: 0.85em;
        }
      `}</style>
        </div>
    );
}
