import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="w-24 h-24 rounded-3xl liquid-glass mx-auto mb-8 flex items-center justify-center sunbeam-hover">
          <span className="text-4xl font-bold">404</span>
        </div>
        <h1 className="mb-4 text-3xl sm:text-4xl font-bold">Page Not Found</h1>
        <p className="mb-2 font-jp text-muted-foreground">ページが見つかりません</p>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
