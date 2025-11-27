import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Check, X, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Attendance() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedClass, setSelectedClass] = useState<string>("");

    // Mock data for demonstration
    const students = [
        { id: "1", name: "Peter Ng'andu", status: "Present" },
        { id: "2", name: "Grace Phiri", status: "Present" },
        { id: "3", name: "John Banda", status: "Absent" },
        { id: "4", name: "Mary Tembo", status: "Late" },
        { id: "5", name: "James Mwale", status: "Present" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Attendance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage daily student attendance.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Download Report</Button>
                    <Button>Save Attendance</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Selection</CardTitle>
                            <CardDescription>Choose class and date</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Class</label>
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7A">Grade 7A</SelectItem>
                                        <SelectItem value="7B">Grade 7B</SelectItem>
                                        <SelectItem value="8A">Grade 8A</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <span className="text-sm">Present</span>
                                </div>
                                <span className="font-bold">3</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-sm">Absent</span>
                                </div>
                                <span className="font-bold">1</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                    <span className="text-sm">Late</span>
                                </div>
                                <span className="font-bold">1</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Attendance Rate</span>
                                    <span className="font-bold text-emerald-600">80%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>Mark attendance for the selected class</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedClass ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Remarks</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{student.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(student.status)}>
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">-</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50">
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
                                <p>Please select a class to view the student list.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
