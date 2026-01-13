import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MoveLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4 text-center animate-in fade-in duration-500">
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center space-y-8">
        {/* Animated Icon Circle */}
        <div className="relative flex aspect-square w-32 items-center justify-center rounded-full bg-destructive/10 animate-bounce delay-100">
          <div className="absolute inset-0 animate-ping rounded-full bg-destructive/5 opacity-50"></div>
          <AlertCircle className="h-16 w-16 text-destructive" strokeWidth={1.5} />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter text-foreground sm:text-8xl w-full">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-[400px] text-muted-foreground md:text-lg">
            Sorry, we couldn't find the page you're looking for. The link might be broken or the school context invalid.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
            <Link to="/">
              <MoveLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute left-1/4 top-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 -z-10 h-72 w-72 rounded-full bg-destructive/5 blur-3xl" />
    </div>
  );
};

export default NotFound;
