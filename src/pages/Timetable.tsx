import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";

export default function Timetable() {
    const [selectedClass, setSelectedClass] = useState("7A");
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

    // Mock schedule data
    const schedule = {
        Monday: [
            { time: "08:00", subject: "Mathematics", teacher: "Mr. Mwale", room: "Rm 101", type: "core" },
            { time: "09:00", subject: "English", teacher: "Mrs. Phiri", room: "Rm 101", type: "core" },
            { time: "10:00", subject: "Break", type: "break" },
            { time: "11:00", subject: "Science", teacher: "Mr. Banda", room: "Lab 1", type: "core" },
        ],
        Tuesday: [
            { time: "08:00", subject: "Social Studies", teacher: "Ms. Tembo", room: "Rm 101", type: "core" },
            { time: "09:00", subject: "Mathematics", teacher: "Mr. Mwale", room: "Rm 101", type: "core" },
        ],
        // ... other days
    };

    const getSubjectColor = (subject: string) => {
        if (subject === "Break") return "bg-slate-100 text-slate-500 border-slate-200";
        if (subject === "Mathematics") return "bg-blue-100 text-blue-700 border-blue-200";
        if (subject === "English") return "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (subject === "Science") return "bg-purple-100 text-purple-700 border-purple-200";
        return "bg-white border-slate-200";
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Timetable
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage class and teacher schedules.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7A">Grade 7A</SelectItem>
                            <SelectItem value="7B">Grade 7B</SelectItem>
                            <SelectItem value="8A">Grade 8A</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>Edit Schedule</Button>
                </div>
            </div>

            <Tabs defaultValue="Monday" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    {days.map((day) => (
                        <TabsTrigger key={day} value={day} className="min-w-[100px]">
                            {day}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {days.map((day) => (
                    <TabsContent key={day} value={day} className="mt-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {schedule[day as keyof typeof schedule]?.map((slot, index) => (
                                <Card key={index} className={`border-l-4 ${slot.subject === 'Break' ? 'border-l-slate-400 bg-slate-50' : 'border-l-primary'}`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {slot.time}
                                            </Badge>
                                            {slot.room && (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {slot.room}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg mt-2">{slot.subject}</CardTitle>
                                    </CardHeader>
                                    {slot.teacher && (
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="h-4 w-4" />
                                                <span>{slot.teacher}</span>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                            {!schedule[day as keyof typeof schedule] && (
                                <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    No classes scheduled for this day.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
