import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <CollapsibleNavbar />
    <SEO title="Privacy Policy – Bibue" description="Bibue's comprehensive privacy policy: data collection, GDPR/CCPA rights, security measures, retention schedules, and third-party processors." />
    <main id="main-content" className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-1">Last updated: March 16, 2026</p>
      <p className="text-muted-foreground text-sm mb-8">Effective date: March 16, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        {/* Intro */}
        <section>
          <p>Bibue ("we," "us," "our") operates the Bibue platform at bibue.com and associated mobile applications. This Privacy Policy explains exactly what personal data we collect, why we collect it, how we protect it, how long we keep it, and what rights you have over it.</p>
          <p className="mt-2">By using Bibue you agree to this policy. If you do not agree, please do not use the platform.</p>
        </section>

        {/* 1. Data We Collect */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">1. Data We Collect</h2>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">1.1 Account Data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email address (required for registration)</li>
            <li>Username and display name</li>
            <li>Profile avatar and banner image URLs</li>
            <li>Bio, location, and website (optional)</li>
            <li>OAuth tokens when linking third-party accounts (AniList, MyAnimeList)</li>
            <li>Hashed password (bcrypt, cost factor 12)</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">1.2 Payment Data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Subscription status, plan tier, billing period start/end dates</li>
            <li>Transaction amounts (stored as integer cents)</li>
            <li>Payout method preferences for creators</li>
            <li>We do <strong className="text-foreground">not</strong> store credit card numbers, CVVs, or full bank account numbers — Stripe handles all payment card data directly</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">1.3 Reading &amp; Usage Data (CUR Data)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Watchlist entries: media ID, title, status (watching/completed/plan_to_watch), episodes watched, chapters read, personal score, notes</li>
            <li>Viewing history: media ID, title, last episode/chapter, timestamps</li>
            <li>Reading progress: series ID, chapter ID, page number, completion percentage, reading direction preference</li>
            <li>Votes and reactions on episodes, chapters, and media</li>
            <li>Community activity: discussions, replies, comments, poll votes</li>
            <li>Bridge credits usage and voting history</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">1.4 Device &amp; Technical Data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address (logged by infrastructure providers, not stored in our application database)</li>
            <li>Browser user-agent string</li>
            <li>Device type and screen resolution (for responsive layout)</li>
            <li>Referrer URL</li>
            <li>Timezone and locale preferences</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">1.5 Communications Data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Direct messages between users (optionally end-to-end encrypted with ECDH P-256)</li>
            <li>Support ticket messages and attachments</li>
            <li>Bug report descriptions and severity levels</li>
            <li>DMCA claim details (claimant name, email, company, content URLs, sworn statements)</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">1.6 Cookies &amp; Local Storage</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Essential cookies:</strong> Authentication session tokens (Supabase auth), CSRF protection</li>
            <li><strong className="text-foreground">Functional storage:</strong> Theme preference, language selection, spoiler-free mode, incognito mode toggle</li>
            <li><strong className="text-foreground">Analytics cookies:</strong> Aggregate page-view counts (no cross-site tracking, no advertising cookies)</li>
          </ul>
          <p className="mt-2">We do not use third-party advertising cookies or participate in ad exchanges.</p>
        </section>

        {/* 2. Legal Basis */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">2. Legal Basis for Processing (GDPR Article 6)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Purpose</th>
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Legal Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-2">Account creation &amp; authentication</td><td className="p-2">Contract performance (Art. 6(1)(b))</td></tr>
                <tr><td className="p-2">Providing reading/watching services</td><td className="p-2">Contract performance (Art. 6(1)(b))</td></tr>
                <tr><td className="p-2">Processing subscriptions &amp; payouts</td><td className="p-2">Contract performance (Art. 6(1)(b))</td></tr>
                <tr><td className="p-2">Personalized recommendations</td><td className="p-2">Legitimate interest (Art. 6(1)(f)) — improving user experience</td></tr>
                <tr><td className="p-2">Community features (discussions, polls)</td><td className="p-2">Consent (Art. 6(1)(a)) — voluntary participation</td></tr>
                <tr><td className="p-2">Content moderation &amp; safety</td><td className="p-2">Legitimate interest (Art. 6(1)(f)) — platform safety</td></tr>
                <tr><td className="p-2">DMCA &amp; legal compliance</td><td className="p-2">Legal obligation (Art. 6(1)(c))</td></tr>
                <tr><td className="p-2">Analytics (aggregate)</td><td className="p-2">Legitimate interest (Art. 6(1)(f)) — service improvement</td></tr>
                <tr><td className="p-2">Tax record retention</td><td className="p-2">Legal obligation (Art. 6(1)(c))</td></tr>
                <tr><td className="p-2">Security monitoring &amp; fraud prevention</td><td className="p-2">Legitimate interest (Art. 6(1)(f))</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. How We Use Your Data */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, maintain, and improve Bibue services</li>
            <li>Personalize content recommendations based on your watchlist and reading history</li>
            <li>Process creator payouts and subscription billing</li>
            <li>Moderate content and enforce community guidelines</li>
            <li>Send transactional notifications (new chapters, episode alerts) based on your notification preferences</li>
            <li>Respond to support tickets and bug reports</li>
            <li>Generate aggregate, anonymized analytics for creators (view counts, country-level distribution)</li>
            <li>Comply with legal obligations (DMCA takedowns, tax reporting)</li>
          </ul>
          <p className="mt-3 font-semibold text-foreground">We do not sell, rent, or trade your personal data to any third party. Ever.</p>
        </section>

        {/* 4. Security */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">4. Data Storage &amp; Security</h2>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">4.1 Encryption</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">In transit:</strong> All connections use TLS 1.2+ (TLS 1.3 preferred). HSTS is enforced.</li>
            <li><strong className="text-foreground">At rest:</strong> Database encrypted with AES-256. Backups encrypted with AES-256-GCM.</li>
            <li><strong className="text-foreground">Passwords:</strong> Hashed with bcrypt (cost factor 12). We never store plaintext passwords.</li>
            <li><strong className="text-foreground">Direct messages:</strong> Optional end-to-end encryption using ECDH P-256 key exchange with AES-256-GCM message encryption. When E2EE is enabled, we cannot read message contents.</li>
            <li><strong className="text-foreground">OAuth tokens:</strong> Encrypted with AES-256-GCM before storage, using server-side encryption keys.</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">4.2 Infrastructure Security</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Row-Level Security (RLS) enforced on all database tables — users can only access their own data</li>
            <li>Edge Functions validate request origin and enforce CORS policies</li>
            <li>Input validation via Zod schemas on all user-facing endpoints</li>
            <li>Content Security Policy (CSP) headers with strict-origin-when-cross-origin referrer policy</li>
            <li>X-Content-Type-Options: nosniff on all responses</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">4.3 Incident Response</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>We maintain an internal incident response plan</li>
            <li>In the event of a data breach affecting your personal data, we will notify affected users within <strong className="text-foreground">72 hours</strong> as required by GDPR Article 33</li>
            <li>We will simultaneously notify the relevant supervisory authority</li>
            <li>SOC 2 Type II certification is on our security roadmap</li>
          </ul>
        </section>

        {/* 5. Retention */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Retention Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Data Category</th>
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Retention Period</th>
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-2">Account profile data</td><td className="p-2">Until account deletion + 90-day recovery window</td><td className="p-2">Service provision &amp; recovery</td></tr>
                <tr><td className="p-2">Watchlist &amp; reading progress</td><td className="p-2">Until account deletion</td><td className="p-2">Core service feature</td></tr>
                <tr><td className="p-2">Viewing history / CUR logs</td><td className="p-2">36 months from creation, then anonymized</td><td className="p-2">Recommendations &amp; creator analytics</td></tr>
                <tr><td className="p-2">Direct messages</td><td className="p-2">Until deleted by sender, or account deletion</td><td className="p-2">User-controlled</td></tr>
                <tr><td className="p-2">Support tickets</td><td className="p-2">24 months after resolution</td><td className="p-2">Quality assurance &amp; dispute resolution</td></tr>
                <tr><td className="p-2">Payment &amp; tax records</td><td className="p-2">7 years from transaction date</td><td className="p-2">Legal/tax obligation</td></tr>
                <tr><td className="p-2">DMCA records</td><td className="p-2">7 years from resolution</td><td className="p-2">Legal obligation</td></tr>
                <tr><td className="p-2">Content moderation logs</td><td className="p-2">24 months</td><td className="p-2">Platform safety &amp; appeals</td></tr>
                <tr><td className="p-2">Ban records</td><td className="p-2">Duration of ban + 12 months</td><td className="p-2">Enforcement integrity</td></tr>
                <tr><td className="p-2">Server/access logs</td><td className="p-2">90 days</td><td className="p-2">Security monitoring</td></tr>
                <tr><td className="p-2">Analytics (aggregate)</td><td className="p-2">Indefinite (anonymized)</td><td className="p-2">Business intelligence</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. International Transfers */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">6. International Data Transfers</h2>
          <p>Bibue operates globally. Your data may be transferred to, and processed in, countries other than your country of residence. We ensure adequate protection through the following mechanisms:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-foreground">EU/EEA:</strong> Standard Contractual Clauses (SCCs) as adopted by the European Commission (June 2021 version)</li>
            <li><strong className="text-foreground">UK:</strong> International Data Transfer Agreements (IDTAs) and UK Addendum to EU SCCs</li>
            <li><strong className="text-foreground">Japan:</strong> Compliance with the Act on Protection of Personal Information (APPI) Article 28 — transfers only to countries with equivalent protections or with appropriate safeguards</li>
            <li><strong className="text-foreground">South Korea:</strong> Compliance with the Personal Information Protection Act (PIPA) — data processed within PIPA-compliant infrastructure with user notification of cross-border transfers</li>
            <li><strong className="text-foreground">China:</strong> Where applicable, compliance with PIPL Article 38 — standard contracts filed with the Cyberspace Administration of China</li>
          </ul>
        </section>

        {/* 7. Your Rights */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Privacy Rights</h2>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">7.1 GDPR Rights (EU/EEA/UK Residents)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Right of access</strong> (Art. 15) — request a copy of all personal data we hold about you</li>
            <li><strong className="text-foreground">Right to rectification</strong> (Art. 16) — correct inaccurate data via account settings or by contacting us</li>
            <li><strong className="text-foreground">Right to erasure</strong> (Art. 17) — request deletion of your account and associated data</li>
            <li><strong className="text-foreground">Right to restriction</strong> (Art. 18) — request we limit processing while a dispute is resolved</li>
            <li><strong className="text-foreground">Right to data portability</strong> (Art. 20) — receive your data in a structured, machine-readable format (JSON)</li>
            <li><strong className="text-foreground">Right to object</strong> (Art. 21) — object to processing based on legitimate interest</li>
            <li><strong className="text-foreground">Right to withdraw consent</strong> (Art. 7(3)) — withdraw consent at any time for consent-based processing</li>
            <li><strong className="text-foreground">Right to lodge a complaint</strong> with your local Data Protection Authority</li>
          </ul>
          <p className="mt-2">Response timeframe: within <strong className="text-foreground">30 calendar days</strong> of verified request (extendable by 60 days for complex requests, with notification).</p>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">7.2 CCPA/CPRA Rights (California Residents)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Right to know</strong> — what personal information we collect, use, disclose, and sell</li>
            <li><strong className="text-foreground">Right to delete</strong> — request deletion of personal information</li>
            <li><strong className="text-foreground">Right to correct</strong> — correct inaccurate personal information</li>
            <li><strong className="text-foreground">Right to opt-out of sale/sharing</strong> — we do not sell or share personal information for cross-context behavioral advertising</li>
            <li><strong className="text-foreground">Right to non-discrimination</strong> — we will not discriminate against you for exercising your rights</li>
            <li><strong className="text-foreground">Right to limit use of sensitive personal information</strong></li>
          </ul>
          <p className="mt-2">Response timeframe: within <strong className="text-foreground">45 calendar days</strong> (extendable by 45 days with notification).</p>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">7.3 APPI Rights (Japan Residents)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Right to request disclosure of retained personal data</li>
            <li>Right to request correction, addition, or deletion</li>
            <li>Right to request cessation of use or provision to third parties</li>
          </ul>
          <p className="mt-2">Response timeframe: within <strong className="text-foreground">30 days</strong>.</p>

          <h3 className="text-sm font-semibold text-foreground mt-4 mb-2">7.4 PIPA Rights (South Korea Residents)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Right to access, correct, delete, and suspend processing of personal information</li>
            <li>Right to be notified of the collection and use purposes</li>
            <li>Right to be informed of cross-border data transfers</li>
          </ul>
          <p className="mt-2">Response timeframe: within <strong className="text-foreground">10 days</strong>.</p>
        </section>

        {/* 8. Children */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">8. Children's Privacy</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bibue is not directed at children under the age of <strong className="text-foreground">13</strong> (COPPA) or under <strong className="text-foreground">16</strong> in jurisdictions where GDPR applies</li>
            <li>We do not knowingly collect personal data from children below these age thresholds</li>
            <li>If we become aware that we have collected personal data from a child without verified parental consent, we will delete that data within <strong className="text-foreground">72 hours</strong></li>
            <li>Parents or guardians may contact us at <strong className="text-foreground">privacy@bibue.net</strong> to request deletion of a child's data</li>
            <li>Age verification is performed during account registration</li>
          </ul>
        </section>

        {/* 9. Publisher/Creator Data Sharing */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">9. What Publishers &amp; Creators Receive</h2>
          <p className="mb-2">Creators and publishers with content on Bibue receive the following data about their titles:</p>

          <h3 className="text-sm font-semibold text-foreground mt-3 mb-2">Data they DO receive:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Aggregate view counts per chapter/series</li>
            <li>Aggregate like/reaction counts</li>
            <li>Country-level geographic distribution (no city-level or IP-level)</li>
            <li>Monthly earnings breakdowns</li>
            <li>Series follower counts (numeric total only)</li>
            <li>Chapter completion rates (anonymized percentages)</li>
          </ul>

          <h3 className="text-sm font-semibold text-foreground mt-3 mb-2">Data they do NOT receive:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Individual reader identities, usernames, or email addresses</li>
            <li>Individual reading sessions or timestamps</li>
            <li>Reader IP addresses or device information</li>
            <li>Reader watchlists, ratings, or cross-platform activity</li>
            <li>Any personally identifiable information (PII) about readers</li>
          </ul>
        </section>

        {/* 10. Third-Party Processors */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">10. Third-Party Processors &amp; Sub-processors</h2>
          <p className="mb-3">We use the following third-party services to operate Bibue. Each has been vetted for adequate data protection:</p>
          <div className="overflow-x-auto">
            <table className="w-full border border-border text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Provider</th>
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Purpose</th>
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Data Processed</th>
                  <th className="text-left p-2 border-b border-border text-foreground font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-2 font-medium text-foreground">Supabase</td><td className="p-2">Database, authentication, storage, edge functions</td><td className="p-2">All application data</td><td className="p-2">AWS US/EU</td></tr>
                <tr><td className="p-2 font-medium text-foreground">Amazon Web Services (AWS)</td><td className="p-2">Infrastructure hosting</td><td className="p-2">All application data (via Supabase)</td><td className="p-2">US/EU regions</td></tr>
                <tr><td className="p-2 font-medium text-foreground">Cloudflare</td><td className="p-2">CDN, DDoS protection, DNS</td><td className="p-2">IP addresses, request metadata</td><td className="p-2">Global edge network</td></tr>
                <tr><td className="p-2 font-medium text-foreground">Stripe</td><td className="p-2">Payment processing</td><td className="p-2">Payment card data, billing address, transaction amounts</td><td className="p-2">US/EU</td></tr>
                <tr><td className="p-2 font-medium text-foreground">Wise (TransferWise)</td><td className="p-2">Creator payout disbursement</td><td className="p-2">Creator bank details, payout amounts</td><td className="p-2">EU/UK</td></tr>
                <tr><td className="p-2 font-medium text-foreground">OpenAI / Google AI</td><td className="p-2">AI-powered recommendations, content moderation assistance</td><td className="p-2">Anonymized content metadata, user preference patterns (no PII)</td><td className="p-2">US</td></tr>
                <tr><td className="p-2 font-medium text-foreground">AniList API</td><td className="p-2">Anime/manga metadata, list sync</td><td className="p-2">OAuth tokens, list data</td><td className="p-2">US</td></tr>
                <tr><td className="p-2 font-medium text-foreground">MyAnimeList API</td><td className="p-2">Anime/manga metadata, list sync</td><td className="p-2">OAuth tokens, list data</td><td className="p-2">Japan</td></tr>
                <tr><td className="p-2 font-medium text-foreground">MangaDex API</td><td className="p-2">Manga chapter metadata</td><td className="p-2">No user data sent</td><td className="p-2">EU</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2">We maintain Data Processing Agreements (DPAs) with all processors that handle personal data.</p>
        </section>

        {/* 11. Changes */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to This Policy</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We will notify users of material changes via email and/or in-app notification at least <strong className="text-foreground">30 days</strong> before they take effect</li>
            <li>The "Last updated" date at the top of this page will always reflect the most recent revision</li>
            <li>Continued use of Bibue after changes take effect constitutes acceptance of the revised policy</li>
            <li>Previous versions of this policy are available upon request</li>
          </ul>
        </section>

        {/* 12. Contact */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact &amp; Data Protection Officer</h2>
          <p>For any privacy-related questions, data requests, or complaints:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-foreground">Email:</strong> privacy@bibue.net</li>
            <li><strong className="text-foreground">Support:</strong> Submit a ticket via the Support page at bibue.com/support</li>
            <li><strong className="text-foreground">Response SLA:</strong> We acknowledge all privacy requests within <strong className="text-foreground">72 hours</strong> and provide a substantive response within the timeframes specified in Section 7</li>
          </ul>
          <p className="mt-3">If you are not satisfied with our response, you have the right to lodge a complaint with your local Data Protection Authority.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPage;
