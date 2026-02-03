import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsModeratorOrAdmin } from "@/hooks/useModeration";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportQueue } from "@/components/admin/ReportQueue";
import { UserManagement } from "@/components/admin/UserManagement";
import { Shield, AlertTriangle, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: hasAccess, isLoading: roleLoading } = useIsModeratorOrAdmin();

  const isLoading = authLoading || roleLoading;

  // Redirect if not authenticated or not a mod/admin
  useEffect(() => {
    if (!isLoading && (!user || hasAccess === false)) {
      navigate("/", { replace: true });
    }
  }, [isLoading, user, hasAccess, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying access...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage reports, users, and community moderation
          </p>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <ReportQueue />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
