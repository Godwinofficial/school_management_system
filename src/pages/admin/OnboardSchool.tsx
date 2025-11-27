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
        subscriptionPlanId: '',
        billingCycle: 'monthly' as 'monthly' | 'annual',
        startDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.centerNumber || !formData.province ||
                !formData.district || !formData.email || !formData.subscriptionPlanId) {
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
                subscriptionPlanId: formData.subscriptionPlanId,
                billingCycle: formData.billingCycle,
                startDate: formData.startDate,
            };

            // Create school
            const school = SchoolService.createSchool(schoolData, currentUser.id);

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

                    {/* Subscription */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscription Details</CardTitle>
                            <CardDescription>Set up the school's subscription plan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="plan">Subscription Plan *</Label>
                                    <Select
                                        value={formData.subscriptionPlanId}
                                        onValueChange={(value) => setFormData({ ...formData, subscriptionPlanId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    {plan.name} - ${plan.price}/{plan.billingCycle}
                                                    {plan.id !== 'trial' && ` (${plan.features.maxStudents} students)`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billing">Billing Cycle *</Label>
                                    <Select
                                        value={formData.billingCycle}
                                        onValueChange={(value: 'monthly' | 'annual') => setFormData({ ...formData, billingCycle: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select cycle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="annual">Annual (Save 20%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    <Input
                                        type="text"
                                        value="Auto-calculated based on plan"
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>

                            {/* Plan Features Preview */}
                            {formData.subscriptionPlanId && (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h4 className="font-medium text-purple-900 mb-2">Plan Features</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-purple-700">
                                        <div>Max Students: {SUBSCRIPTION_PLANS[formData.subscriptionPlanId].features.maxStudents}</div>
                                        <div>Max Teachers: {SUBSCRIPTION_PLANS[formData.subscriptionPlanId].features.maxTeachers}</div>
                                        <div>Storage: {SUBSCRIPTION_PLANS[formData.subscriptionPlanId].features.storage}</div>
                                        <div>Modules: {SUBSCRIPTION_PLANS[formData.subscriptionPlanId].features.modules.join(', ')}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                        subscriptionPlanId: '',
                        billingCycle: 'monthly',
                        startDate: new Date().toISOString().split('T')[0],
                    });
                }}
            />
        </>
    );
}
