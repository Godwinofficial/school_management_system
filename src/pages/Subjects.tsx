import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { BookOpen, Plus, Search, Trash2, Edit, Save, X } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { SubjectService, Subject } from "@/lib/SubjectService";
import { toast } from "@/hooks/use-toast";

export default function Subjects() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState<Partial<Subject>>({
        name: "",
        code: "",
        category: "Core"
    });

    const user = AuthService.getCurrentUser();

    useEffect(() => {
        loadSubjects();
    }, [user?.school?.id]);

    const loadSubjects = async () => {
        if (user?.school?.id) {
            const data = await SubjectService.getAllSubjects(user.school.id);
            setSubjects(data);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code) {
            toast({
                title: "Validation Error",
                description: "Name and Code are required",
                variant: "destructive"
            });
            return;
        }

        try {
            await SubjectService.saveSubject({
                ...formData,
                id: editingSubject?.id,
                school_id: user?.school?.id
            });

            toast({
                title: editingSubject ? "Subject Updated" : "Subject Created",
                description: `Successfully saved ${formData.name}`,
                className: "bg-emerald-500 text-white border-none"
            });

            setIsAddDialogOpen(false);
            setEditingSubject(null);
            setFormData({ name: "", code: "", category: "Core" });
            loadSubjects();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save subject",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this subject?")) {
            const success = await SubjectService.deleteSubject(id);
            if (success) {
                toast({ title: "Subject Deleted" });
                loadSubjects();
            }
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                        School Subjects
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage the educational curriculum and subject list for your school
                    </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => {
                                setEditingSubject(null);
                                setFormData({ name: "", code: "", category: "Core" });
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subject
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                            <DialogDescription>
                                Define a subject that can be assigned to teachers and students.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Subject Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Mathematics"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Subject Code *</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g., MATH101"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Core">Core</SelectItem>
                                        <SelectItem value="Elective">Elective</SelectItem>
                                        <SelectItem value="Optional">Optional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief overview of the subject"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Subject</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-0 shadow-soft">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Subject Registry
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subjects..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>School Coverage</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubjects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No subjects found. Add your first subject to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubjects.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="font-medium">{subject.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {subject.code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                subject.category === 'Core' ? 'bg-emerald-100 text-emerald-700' :
                                                    subject.category === 'Elective' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }>
                                                {subject.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground italic">
                                                {subject.school_id ? 'School Specific' : 'National Curriculum'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingSubject(subject);
                                                        setFormData(subject);
                                                        setIsAddDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(subject.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
