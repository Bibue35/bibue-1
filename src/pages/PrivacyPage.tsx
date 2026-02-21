import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <CollapsibleNavbar />
    <SEO title="Privacy Policy – Bibue" description="Bibue's privacy policy explains how we collect, use, and protect your data." />
    <main id="main-content" className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-6">Last updated: February 21, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p>When you create an account, we collect your email address and username. We also collect usage data such as your watchlist, ratings, and viewing history to personalize your experience.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, personalize recommendations, and communicate with you about your account. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Storage & Security</h2>
          <p>Your data is stored securely with encryption at rest and in transit. We use industry-standard security measures to protect your information. Direct messages support end-to-end encryption.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Cookies & Tracking</h2>
          <p>We use essential cookies for authentication and session management. We may use analytics to understand how users interact with our platform. You can control cookie preferences in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Your Rights</h2>
          <p>You can access, update, or delete your personal data at any time through your account settings. You may also request a copy of your data or ask us to delete your account entirely.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Third-Party Services</h2>
          <p>We integrate with third-party services such as AniList and MyAnimeList for syncing your anime and manga lists. These services have their own privacy policies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Contact</h2>
          <p>If you have questions about this privacy policy, please contact us through our community channels.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPage;
