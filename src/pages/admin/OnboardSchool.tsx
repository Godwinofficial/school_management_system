import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { SchoolService, type SchoolData, type School } from "@/lib/SchoolService";
import { SUBSCRIPTION_PLANS } from "@/lib/SchoolStructure";
import { SchoolCreatedModal } from "@/components/SchoolCreatedModal";
import { AuthService } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function AddSchool() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdSchool, setCreatedSchool] = useState<School | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        centerNumber: '',
        province: '',
        district: '',
        ward: '',
        email: '',
        phone: '',
        type: 'GRZ',
        type: 'GRZ',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.centerNumber || !formData.province ||
                !formData.district || !formData.email) {
                toast({
                    title: "Validation Error",
                    description: "Please fill in all required fields",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            // Get current super admin
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser || currentUser.role !== 'super_admin') {
                toast({
                    title: "Authorization Error",
                    description: "Only super admins can create schools",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            // Prepare school data
            const schoolData: SchoolData = {
                name: formData.name,
                centerNumber: formData.centerNumber,
                contact: {
                    email: formData.email,
                    phone: formData.phone || undefined,
                },
                location: {
                    province: formData.province,
                    district: formData.district,
                    ward: formData.ward || undefined,
                },
                type: formData.type,
                subscriptionPlanId: 'trial',
                billingCycle: 'monthly',
                startDate: new Date().toISOString(),
            };

            // Create school
            const school = await SchoolService.createSchool(schoolData, currentUser.id);

            // Send welcome email (simulated)
            SchoolService.sendWelcomeEmail(school);

            // Show success modal
            setCreatedSchool(school);
            setShowSuccessModal(true);

            toast({
                title: "Success!",
                description: `${school.name} has been successfully onboarded`,
                className: "bg-green-600 text-white",
            });

        } catch (error) {
            console.error('Error creating school:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create school",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="space-y-6 p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Link to="/admin/schools">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Add New School</h1>
                        <p className="text-muted-foreground mt-1">Onboard a new school client</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* School Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>School Information</CardTitle>
                            <CardDescription>Basic details about the school</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">School Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter school name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="centerNumber">Center Number *</Label>
                                    <Input
                                        id="centerNumber"
                                        placeholder="e.g., LPS001"
                                        required
                                        value={formData.centerNumber}
                                        onChange={(e) => setFormData({ ...formData, centerNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="province">Province *</Label>
                                    <Select
                                        value={formData.province}
                                        onValueChange={(value) => setFormData({ ...formData, province: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select province" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Lusaka">Lusaka</SelectItem>
                                            <SelectItem value="Copperbelt">Copperbelt</SelectItem>
                                            <SelectItem value="Southern">Southern</SelectItem>
                                            <SelectItem value="Central">Central</SelectItem>
                                            <SelectItem value="Eastern">Eastern</SelectItem>
                                            <SelectItem value="Luapula">Luapula</SelectItem>
                                            <SelectItem value="Northern">Northern</SelectItem>
                                            <SelectItem value="North-Western">North-Western</SelectItem>
                                            <SelectItem value="Western">Western</SelectItem>
                                            <SelectItem value="Muchinga">Muchinga</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="district">District *</Label>
                                    <Input
                                        id="district"
                                        placeholder="Enter district"
                                        required
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ward">Ward</Label>
                                    <Input
                                        id="ward"
                                        placeholder="Enter ward"
                                        value={formData.ward}
                                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Contact Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="school@example.zm"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+260 xxx xxx xxx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">School Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GRZ">GRZ (Government)</SelectItem>
                                        <SelectItem value="Grant Aided">Grant Aided</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                        <SelectItem value="Community">Community</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Removed Subscription Details Card */}

                    {/* Submit */}
                    <div className="flex gap-4 justify-end">
                        <Link to="/admin/schools">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-purple-500 to-indigo-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating School...
                                </>
                            ) : (
                                'Create School'
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            <SchoolCreatedModal
                open={showSuccessModal}
                school={createdSchool}
                onClose={() => {
                    setShowSuccessModal(false);
                    // Reset form
                    setFormData({
                        name: '',
                        centerNumber: '',
                        province: '',
                        district: '',
                        ward: '',
                        email: '',
                        phone: '',
                        type: 'GRZ',
                        type: 'GRZ',
                    });
                }}
            />
        </>
    );
}
