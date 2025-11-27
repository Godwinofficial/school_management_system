import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Download, Search, Plus, TrendingUp, TrendingDown } from "lucide-react";

export default function Finance() {
    const [searchTerm, setSearchTerm] = useState("");

    // Mock transactions
    const transactions = [
        { id: "TRX-001", student: "Peter Ng'andu", type: "School Fees", amount: 1500, date: "2024-03-15", status: "Paid" },
        { id: "TRX-002", student: "Grace Phiri", type: "Uniform", amount: 450, date: "2024-03-14", status: "Pending" },
        { id: "TRX-003", student: "John Banda", type: "Exam Fees", amount: 300, date: "2024-03-12", status: "Paid" },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Finance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage school fees, payments, and financial reports.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Payment
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Term 1)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">K45,231.89</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">K12,450.00</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                            15 students with overdue fees
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">78%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Target: 90% by end of term
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="transactions">
                <TabsList>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((trx) => (
                                    <TableRow key={trx.id}>
                                        <TableCell className="font-mono text-sm">{trx.id}</TableCell>
                                        <TableCell>{trx.student}</TableCell>
                                        <TableCell>{trx.type}</TableCell>
                                        <TableCell>{trx.date}</TableCell>
                                        <TableCell>K{trx.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={trx.status === 'Paid' ? 'default' : 'secondary'} className={trx.status === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                {trx.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card className="p-12 text-center text-muted-foreground border-dashed">
                        Invoices module coming soon.
                    </Card>
                </TabsContent>

                <TabsContent value="reports">
                    <Card className="p-12 text-center text-muted-foreground border-dashed">
                        Financial reports module coming soon.
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
