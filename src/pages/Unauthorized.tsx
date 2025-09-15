import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/5">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto mb-6">
          <Shield className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        <Button 
          onClick={() => navigate(-1)}
          variant="outline"
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button 
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-primary to-success"
        >
          Dashboard
        </Button>
      </div>
    </div>
  );
}