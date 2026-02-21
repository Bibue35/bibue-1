import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsModeratorOrAdmin } from "@/hooks/useModeration";
import { useLanguage } from "@/contexts/LanguageContext";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportQueue } from "@/components/admin/ReportQueue";
import { UserManagement } from "@/components/admin/UserManagement";
import { Shield, AlertTriangle, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
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
        <CollapsibleNavbar />
        <div className="container mx-auto py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t("admin.verifying")}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="container mx-auto py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">{t("admin.accessDenied")}</h1>
            <p className="text-muted-foreground">
              {t("admin.noPermission")}
            </p>
            <Button onClick={() => navigate("/")}>{t("admin.returnHome")}</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Dashboard" description="Bibue admin dashboard." url="/admin" noIndex />
      <CollapsibleNavbar />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("admin.dashboard")}</h1>
          </div>
          <p className="text-muted-foreground">
            {t("admin.dashboardDesc")}
          </p>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("admin.reports")}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("admin.users")}
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
