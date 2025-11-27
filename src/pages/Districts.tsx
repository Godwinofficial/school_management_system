import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Districts() {
    const districts = [
        { name: "Lusaka", schools: 145, students: 45000, status: "Active" },
        { name: "Chongwe", schools: 82, students: 22000, status: "Active" },
        { name: "Kafue", schools: 65, students: 18500, status: "Active" },
        { name: "Chilanga", schools: 45, students: 12000, status: "Active" },
        { name: "Luangwa", schools: 28, students: 8500, status: "Active" },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Districts Management</h1>
                <p className="text-muted-foreground">
                    Manage districts within the province
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Districts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>District Name</TableHead>
                                <TableHead>Total Schools</TableHead>
                                <TableHead>Total Students</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {districts.map((district) => (
                                <TableRow key={district.name}>
                                    <TableCell className="font-medium">{district.name}</TableCell>
                                    <TableCell>{district.schools}</TableCell>
                                    <TableCell>{district.students.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/30">
                                            {district.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
