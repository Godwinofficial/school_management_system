import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Bell, Send, Users, Megaphone, Calendar, Pin, Loader2, MessageSquare, Trash2, Edit3, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { CommunicationService } from "@/lib/TimetableService";
import { SchoolService } from "@/lib/SchoolService";
import { supabase } from "@/lib/supabaseClient";
import { useRef } from "react";

export default function Messaging() {
    const user = AuthService.getCurrentUser();
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [recipients, setRecipients] = useState<any[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    // Form states
    const [recipientId, setRecipientId] = useState("");
    const [messageContent, setMessageContent] = useState("");
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        content: "",
        audience: "all",
        pinned: false
    });
    const [isPosting, setIsPosting] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    // Track seen IDs to prevent duplicate notifications in polling mode
    const seenMessageIds = useRef<Set<string>>(new Set());
    const seenAnnouncementIds = useRef<Set<string>>(new Set());

    const playNotificationSound = () => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        audio.play().catch(e => console.log("Audio play blocked", e));
    };

    const showBrowserNotification = (title: string, body: string) => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification(title, {
                body,
                icon: "/logo.png" // Fallback to a generic icon if specific one isn't available
            });
        }
    };

    useEffect(() => {
        let pollInterval: any;

        // Request browser notification permission
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        if (user?.school?.id) {
            loadData();

            // Subscribe to real-time updates for THIS school
            const channel = supabase
                .channel(`school-chat-${user.school.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `school_id=eq.${user.school.id}`
                }, (payload) => {
                    console.log('Real-time message sync triggered');
                    loadData(false); // Let loadData handle the notification logic and state update
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'announcements',
                    filter: `school_id=eq.${user.school.id}`
                }, (payload) => {
                    console.log('Real-time announcement sync triggered');
                    loadData(false);
                })

                .subscribe((status) => {
                    console.log('Real-time subscription status:', status);
                    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        console.warn('Real-time failed. Falling back to polling.');
                        pollInterval = setInterval(() => loadData(false), 5000);
                    }
                });



            return () => {
                supabase.removeChannel(channel);
                if (pollInterval) clearInterval(pollInterval);
            };
        }
    }, [user?.school?.id]);

    const loadData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const schoolId = user!.school!.id;
            const audience = user!.role === 'student' ? 'students' :
                user!.role === 'parent' ? 'parents' :
                    ['head_teacher', 'deputy_head', 'senior_teacher', 'class_teacher'].includes(user!.role) ? 'teachers' : 'all';

            const [annData, msgData, recData] = await Promise.all([
                CommunicationService.getAnnouncements(schoolId, audience),
                CommunicationService.getMessages(schoolId, user!.id),
                SchoolService.getTeachers(schoolId)
            ]);

            // Check for new messages/announcements for notifications
            if (!showLoading) {
                msgData.forEach((msg: any) => {
                    if (!seenMessageIds.current.has(msg.id)) {
                        seenMessageIds.current.add(msg.id);
                        if (msg.sender_id !== user!.id) {
                            playNotificationSound();
                            showBrowserNotification(`New message from ${msg.sender?.first_name || 'Teacher'}`, msg.content);
                        }
                    }
                });

                annData.forEach((ann: any) => {
                    if (!seenAnnouncementIds.current.has(ann.id)) {
                        seenAnnouncementIds.current.add(ann.id);
                        playNotificationSound();
                        showBrowserNotification("New Academic Announcement", ann.title);
                    }
                });
            } else {
                // Initial load, just mark everything as seen
                msgData.forEach((msg: any) => seenMessageIds.current.add(msg.id));
                annData.forEach((ann: any) => seenAnnouncementIds.current.add(ann.id));
            }

            setAnnouncements(annData);
            setMessages(msgData);
            setRecipients(recData.filter(r => r.id !== user!.id));
        } catch (error) {
            toast({ title: "Error", description: "Failed to load communications", variant: "destructive" });
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Group messages into conversations
    const conversations = messages.reduce((acc: any, msg: any) => {
        const otherPartyId = msg.sender_id === user!.id ? msg.recipient_id : msg.sender_id;
        const otherParty = msg.sender_id === user!.id ? msg.recipient : msg.sender;

        if (!acc[otherPartyId]) {
            acc[otherPartyId] = {
                id: otherPartyId,
                name: otherParty ? `${otherParty.first_name} ${otherParty.last_name}` : 'Unknown User',
                role: otherParty?.role || 'user',
                lastMessage: msg.content,
                timestamp: msg.created_at,
                messages: []
            };
        }
        acc[otherPartyId].messages.push(msg);
        return acc;
    }, {});

    const sortedConversations = Object.values(conversations).sort((a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const activeConversation: any = activeConversationId ? conversations[activeConversationId] : null;

    const handleSendMessage = async () => {
        const targetId = activeConversationId || recipientId;
        if (!targetId || !messageContent) {
            toast({ title: "Error", description: "Select recipient and type message", variant: "destructive" });
            return;
        }

        try {
            await CommunicationService.sendMessage({
                school_id: user!.school!.id,
                recipient_id: targetId,
                content: messageContent
            }, user!.id);

            // If it was a new chat from the dialog, switch to it
            if (!activeConversationId && recipientId) {
                setActiveConversationId(recipientId);
                setIsDialogOpen(false);
            }

            toast({ title: "Success", description: "Message sent", className: "bg-emerald-500 text-white" });
            setMessageContent("");
            setRecipientId("");
            loadData(false); // Silent update
        } catch (error) {
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
        }
    };

    const handlePublishAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) {
            toast({ title: "Error", description: "Title and message required", variant: "destructive" });
            return;
        }

        setIsPosting(true);
        try {
            await CommunicationService.publishAnnouncement({
                ...newAnnouncement,
                school_id: user!.school!.id
            }, user!.id);

            toast({ title: "Success", description: "Announcement published", className: "bg-emerald-500 text-white" });
            setNewAnnouncement({ title: "", content: "", audience: "all", pinned: false });
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to post announcement", variant: "destructive" });
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeleteConversation = async () => {
        if (!activeConversationId) return;
        if (!confirm("Are you sure you want to delete this entire conversation? This cannot be undone.")) return;

        try {
            await CommunicationService.deleteConversation(user!.id, activeConversationId);
            toast({ title: "Deleted", description: "Conversation removed" });
            setActiveConversationId(null);
            loadData(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
        }
    };

    const handleDeleteMessage = async (msgId: string) => {
        try {
            await CommunicationService.deleteMessage(msgId);
            loadData(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
        }
    };

    const handleStartEdit = (msg: any) => {
        setEditingMessageId(msg.id);
        setEditContent(msg.content);
    };

    const handleSaveEdit = async () => {
        if (!editingMessageId || !editContent) return;
        try {
            await CommunicationService.updateMessage(editingMessageId, editContent);
            setEditingMessageId(null);
            setEditContent("");
            loadData(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to update message", variant: "destructive" });
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
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Messaging & Announcements
                    </h1>
                    <p className="text-muted-foreground mt-1">Communicate with your school community.</p>
                </div>

                {['head_teacher', 'deputy_head', 'senior_teacher'].includes(user!.role) && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg"><Megaphone className="h-4 w-4 mr-2" />New Announcement</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                            <DialogHeader>
                                <DialogTitle>Create Announcement</DialogTitle>
                                <DialogDescription>Send a broadcast message to specific groups.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={newAnnouncement.title}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        placeholder="Important: Term Dates"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Audience</Label>
                                    <Select
                                        value={newAnnouncement.audience}
                                        onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, audience: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Everyone</SelectItem>
                                            <SelectItem value="teachers">Teachers</SelectItem>
                                            <SelectItem value="students">Students</SelectItem>
                                            <SelectItem value="parents">Parents</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Message Content</Label>
                                    <Textarea
                                        value={newAnnouncement.content}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="pin"
                                        checked={newAnnouncement.pinned}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                                    />
                                    <Label htmlFor="pin" className="cursor-pointer">Pin to top</Label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button onClick={handlePublishAnnouncement} disabled={isPosting}>
                                    {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                    Publish Broadcast
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="announcements"><Bell className="h-4 w-4 mr-2" />Announcements</TabsTrigger>
                    <TabsTrigger value="messages"><Send className="h-4 w-4 mr-2" />Direct Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="announcements" className="space-y-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-4">
                        {announcements.map((ann) => (
                            <Card key={ann.id} className={`${ann.pinned ? "border-primary bg-primary/5 shadow-md" : "border-border/50"}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                {ann.pinned && <Pin className="h-4 w-4 text-primary" />}
                                                <CardTitle className="text-xl">{ann.title}</CardTitle>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(ann.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ann.author?.first_name} {ann.author?.last_name}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="capitalize">{ann.audience}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ann.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                        {announcements.length === 0 && <p className="text-center py-10 text-muted-foreground">No announcements found.</p>}
                    </div>
                </TabsContent>

                <TabsContent value="messages" className="space-y-4 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                        <div className="flex flex-col gap-4">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full shadow-md"><Send className="h-4 w-4 mr-2" />New Chat</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Start Conversation</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Select Contact</Label>
                                            <Select value={recipientId} onValueChange={setRecipientId}>
                                                <SelectTrigger><SelectValue placeholder="Search teachers..." /></SelectTrigger>
                                                <SelectContent>
                                                    {recipients.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name} ({r.role.replace('_', ' ')})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Initial Message</Label>
                                            <Textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
                                        </div>
                                    </div>
                                    <Button onClick={() => { handleSendMessage(); }} disabled={!recipientId}>Send First Message</Button>
                                </DialogContent>
                            </Dialog>

                            <Card className="flex-1 overflow-hidden">
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <CardTitle className="text-sm uppercase tracking-wider opacity-60">Recent Conversations</CardTitle>
                                </CardHeader>
                                <div className="divide-y divide-border/50 overflow-y-auto max-h-[500px]">
                                    {sortedConversations.map((conv: any) => (
                                        <div
                                            key={conv.id}
                                            onClick={() => setActiveConversationId(conv.id)}
                                            className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors flex gap-3 ${activeConversationId === conv.id ? "bg-primary/5 border-l-4 border-primary" : ""}`}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-primary/10 text-primary">{conv.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className="text-sm font-bold truncate">{conv.name}</h3>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {new Date(conv.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate italic">"{conv.lastMessage}"</p>
                                            </div>
                                        </div>
                                    ))}
                                    {sortedConversations.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm italic">No active chats.</p>}
                                </div>
                            </Card>
                        </div>

                        <div className="h-[600px] flex flex-col">
                            {activeConversation ? (
                                <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
                                    <CardHeader className="p-4 border-b border-border/50 bg-muted/20 flex flex-row items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/20 text-primary">{activeConversation.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{activeConversation.name}</CardTitle>
                                            <p className="text-[10px] uppercase text-muted-foreground tracking-widest">{activeConversation.role.replace('_', ' ')}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={handleDeleteConversation}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3">
                                        {activeConversation.messages.map((msg: any) => (
                                            <div key={msg.id} className={`flex group ${msg.sender_id === user!.id ? "justify-end" : "justify-start"}`}>
                                                <div className={`relative max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender_id === user!.id ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted dark:bg-zinc-800 rounded-tl-none border border-border/30"}`}>
                                                    {editingMessageId === msg.id ? (
                                                        <div className="space-y-2 min-w-[200px]">
                                                            <Textarea
                                                                value={editContent}
                                                                onChange={(e) => setEditContent(e.target.value)}
                                                                className="text-black dark:text-white bg-white/10 border-white/20 min-h-[60px]"
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="xs" variant="ghost" className="text-xs h-7" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                                                                <Button size="xs" className="text-xs h-7 bg-white text-primary hover:bg-white/90" onClick={handleSaveEdit}>Save</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p>{msg.content}</p>
                                                            <p className={`text-[9px] mt-1 text-right opacity-60 uppercase`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

                                                            {msg.sender_id === user!.id && (
                                                                <div className="absolute top-0 right-full mr-2 hidden group-hover:flex items-center gap-1">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/50 backdrop-blur shadow-sm" onClick={() => handleStartEdit(msg)}>
                                                                        <Edit3 className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/50 backdrop-blur shadow-sm text-destructive" onClick={() => handleDeleteMessage(msg.id)}>
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <div className="p-4 border-t border-border/50 bg-muted/10 flex gap-2">
                                        <Input
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                            placeholder="Type a message..."
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="bg-background"
                                        />
                                        <Button onClick={handleSendMessage} size="icon" className="shrink-0 rounded-full shadow-lg">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                                    <p className="font-medium">Select a conversation to start chatting</p>
                                    <p className="text-xs">Your messages are private and secure.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
