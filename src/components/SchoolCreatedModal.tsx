import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Mail } from "lucide-react";
import { type School } from "@/lib/SchoolService";
import { toast } from "@/hooks/use-toast";

interface SchoolCreatedModalProps {
    open: boolean;
    school: School | null;
    onClose: () => void;
}

export function SchoolCreatedModal({ open, school, onClose }: SchoolCreatedModalProps) {
    if (!school) return null;

    const handleCopyCredentials = () => {
        const text = `
School: ${school.name}
Login URL: ${window.location.origin}

Head Teacher:
Email: ${school.contact.email}
Password: password123

Deputy Head Teacher:
Email: deputy.${school.contact.email}
Password: password123

HOD/Senior Teacher:
Email: senior.${school.contact.email}
Password: password123
        `.trim();

        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard",
            description: "Login credentials copied",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">School Onboarded Successfully!</DialogTitle>
                    <DialogDescription className="text-center">
                        {school.name} has been added to the platform and the head teacher account has been created.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                    <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Head Teacher Credentials</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Email</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">{school.contact.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Password</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">password123</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Deputy Head Teacher Credentials</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Email</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">deputy.{school.contact.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Password</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">password123</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">HOD/Senior Teacher Credentials</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Email</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">senior.{school.contact.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Password</label>
                                <div className="font-mono text-sm bg-background p-2 rounded border">password123</div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleCopyCredentials}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Details
                    </Button>
                    <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" onClick={onClose}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Login Email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
