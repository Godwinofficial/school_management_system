import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { AuthService } from "@/lib/auth";
import { Loader2, History } from "lucide-react";

export default function ActivityLogs() {
    const user = AuthService.getCurrentUser();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.school?.id) {
            fetchLogs();
        }
    }, [user?.school?.id]);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('activity_logs')
                .select(`
                    *,
                    profiles:user_id(first_name, last_name, role)
                `)
                .eq('school_id', user!.school!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-2">
                <History className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Audit Logs</h1>
                    <p className="text-muted-foreground">Monitor all administrative actions and changes within the school portal.</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                    <CardDescription>A complete history of timetable changes and communication broadcasts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{log.profiles?.first_name} {log.profiles?.last_name}</span>
                                            <span className="text-[10px] uppercase text-muted-foreground">{log.profiles?.role?.replace('_', ' ')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            log.action.includes('delete') ? "destructive" :
                                                log.action.includes('create') ? "default" : "secondary"
                                        } className="text-[10px] px-2 py-0">
                                            {log.action.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {log.details}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                                        No activity logs found for this school.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
