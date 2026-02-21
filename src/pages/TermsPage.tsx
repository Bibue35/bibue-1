import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <CollapsibleNavbar />
    <SEO title="Terms of Service – Bibue" description="Terms of service for using Bibue." />
    <main id="main-content" className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: February 21, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using Bibue, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account. You must be at least 13 years old to use Bibue.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Acceptable Use</h2>
          <p>You agree not to use Bibue to harass, abuse, or harm others; post illegal, offensive, or infringing content; attempt to gain unauthorized access to our systems; or use automated tools to scrape or collect data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Content</h2>
          <p>Anime and manga data is sourced from third-party APIs. We do not host or stream copyrighted content. User-generated content (reviews, comments, discussions) remains the property of the user but grants Bibue a license to display it on the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Disclaimers</h2>
          <p>Bibue is provided "as is" without warranties of any kind. We are not responsible for the accuracy of third-party anime/manga data or for any damages arising from use of the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of Bibue after changes constitutes acceptance of the new terms.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsPage;
