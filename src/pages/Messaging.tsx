import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Bell, Send, Users, Megaphone, Calendar, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

export default function Messaging() {
    const [recipient, setRecipient] = useState("");
    const [message, setMessage] = useState("");

    // Mock announcements
    const announcements = [
        {
            id: 1,
            title: "Parent-Teacher Meeting",
            message: "All parents are invited to attend the parent-teacher meeting on Friday, March 22nd at 2:00 PM.",
            date: "2024-03-15",
            author: "Head Teacher",
            pinned: true,
            audience: "Parents"
        },
        {
            id: 2,
            title: "Sports Day Reminder",
            message: "Sports day is scheduled for next week. All students should wear their PE uniforms.",
            date: "2024-03-14",
            author: "Sports Coordinator",
            pinned: false,
            audience: "Students"
        },
        {
            id: 3,
            title: "Staff Meeting",
            message: "Mandatory staff meeting tomorrow at 3:30 PM in the staff room.",
            date: "2024-03-13",
            author: "Deputy Head",
            pinned: false,
            audience: "Teachers"
        }
    ];

    const handleSendMessage = () => {
        if (!recipient || !message) {
            toast({
                title: "Error",
                description: "Please select a recipient and enter a message.",
                variant: "destructive"
            });
            return;
        }

        toast({
            title: "Message Sent",
            description: `Your message has been sent to ${recipient}.`,
            className: "bg-emerald-500 text-white border-none"
        });

        setRecipient("");
        setMessage("");
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Messaging & Announcements
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Communicate with teachers, parents, and students.
                    </p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Megaphone className="h-4 w-4 mr-2" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>
                                Send an announcement to teachers, students, or parents.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="Announcement title" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="audience">Audience</Label>
                                <Select>
                                    <SelectTrigger id="audience">
                                        <SelectValue placeholder="Select audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Everyone</SelectItem>
                                        <SelectItem value="teachers">Teachers</SelectItem>
                                        <SelectItem value="students">Students</SelectItem>
                                        <SelectItem value="parents">Parents</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="announcement">Message</Label>
                                <Textarea
                                    id="announcement"
                                    placeholder="Type your announcement here..."
                                    className="min-h-[120px]"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="pin" className="h-4 w-4" />
                                <Label htmlFor="pin" className="text-sm font-normal cursor-pointer">
                                    Pin this announcement
                                </Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={() => {
                                toast({
                                    title: "Announcement Posted",
                                    description: "Your announcement has been published.",
                                    className: "bg-emerald-500 text-white border-none"
                                });
                            }}>
                                <Send className="h-4 w-4 mr-2" />
                                Publish
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList>
                    <TabsTrigger value="announcements">
                        <Bell className="h-4 w-4 mr-2" />
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger value="messages">
                        <Send className="h-4 w-4 mr-2" />
                        Direct Messages
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="announcements" className="space-y-4 mt-6">
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className={announcement.pinned ? "border-primary" : ""}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {announcement.pinned && (
                                                    <Pin className="h-4 w-4 text-primary" />
                                                )}
                                                <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                            </div>
                                            <CardDescription className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {announcement.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {announcement.author}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary">{announcement.audience}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{announcement.message}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="messages" className="space-y-4 mt-6">
                    <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Recent Conversations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { name: "Mr. Mwale", role: "Mathematics Teacher", unread: 2 },
                                    { name: "Mrs. Phiri", role: "English Teacher", unread: 0 },
                                    { name: "Parent - Grace Phiri", role: "Guardian", unread: 1 }
                                ].map((contact, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{contact.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{contact.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                                        </div>
                                        {contact.unread > 0 && (
                                            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                                {contact.unread}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Send Message</CardTitle>
                                <CardDescription>Send a direct message to a teacher or parent</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Recipient</Label>
                                    <Select value={recipient} onValueChange={setRecipient}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="teacher1">Mr. Mwale (Mathematics)</SelectItem>
                                            <SelectItem value="teacher2">Mrs. Phiri (English)</SelectItem>
                                            <SelectItem value="parent1">Parent - Peter Ng'andu</SelectItem>
                                            <SelectItem value="parent2">Parent - Grace Phiri</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea
                                        placeholder="Type your message here..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="min-h-[200px]"
                                    />
                                </div>
                                <Button onClick={handleSendMessage} className="w-full">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Message
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
