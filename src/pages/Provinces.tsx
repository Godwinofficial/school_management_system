import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Provinces() {
    const provinces = [
        { name: "Lusaka", districts: 6, schools: 450, students: 120000, status: "Active" },
        { name: "Copperbelt", districts: 10, schools: 520, students: 145000, status: "Active" },
        { name: "Southern", districts: 13, schools: 380, students: 98000, status: "Active" },
        { name: "Eastern", districts: 15, schools: 410, students: 105000, status: "Active" },
        { name: "Central", districts: 11, schools: 320, students: 85000, status: "Active" },
        { name: "Northern", districts: 12, schools: 290, students: 78000, status: "Active" },
        { name: "Western", districts: 16, schools: 310, students: 82000, status: "Active" },
        { name: "Luapula", districts: 11, schools: 240, students: 65000, status: "Active" },
        { name: "North-Western", districts: 11, schools: 210, students: 58000, status: "Active" },
        { name: "Muchinga", districts: 8, schools: 190, students: 52000, status: "Active" },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Provinces Management</h1>
                <p className="text-muted-foreground">
                    Overview of all provinces in Zambia
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Provinces</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Province Name</TableHead>
                                <TableHead>Districts</TableHead>
                                <TableHead>Total Schools</TableHead>
                                <TableHead>Total Students</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {provinces.map((province) => (
                                <TableRow key={province.name}>
                                    <TableCell className="font-medium">{province.name}</TableCell>
                                    <TableCell>{province.districts}</TableCell>
                                    <TableCell>{province.schools}</TableCell>
                                    <TableCell>{province.students.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-success/20 text-success hover:bg-success/30">
                                            {province.status}
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
