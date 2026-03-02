import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReactNode } from "react";

export function CreatorAgreementModal({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold">
            Bibue Creator Agreement &amp; Terms of Service
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Effective March 2026</p>
        </DialogHeader>
        <ScrollArea className="h-[65vh] px-6 pb-6">
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Welcome to Bibue Studio. This Creator Agreement ("Agreement") governs your participation as a creator on bibue.net ("Platform"). By submitting content, you agree to the following terms.
            </p>

            <Section title="1. Revenue Share & Earnings">
              <p>Creators receive <strong className="text-foreground">75% of net revenue</strong> generated from their content on Bibue. Net revenue is calculated after deducting hosting, infrastructure, maintenance, and payment processing fees.</p>
              <p><strong className="text-foreground">Founder Bonus:</strong> Qualifying early creators receive an additional <strong className="text-[#FACC15]">5% bonus</strong> (total 80%) for the first 6 months following their first approved publication. The Founder Bonus is applied automatically and may be extended at Bibue's discretion.</p>
              <p>Revenue is generated through Bibue's coin-based monetization system, where readers purchase coins to unlock chapters.</p>
            </Section>

            <Section title="2. Payouts">
              <p>Payouts are processed <strong className="text-foreground">monthly via Stripe</strong>. Creators must maintain a valid Stripe account linked to their Bibue profile. Minimum payout threshold is $25.00 USD. Earnings below the threshold roll over to the following month.</p>
              <p>Bibue reserves the right to withhold payouts if fraudulent activity is detected or if this Agreement has been violated.</p>
            </Section>

            <Section title="3. Submission & Approval">
              <p>All series submissions are reviewed by the Bibue editorial team. We aim to review submissions quickly, typically within a few business days. Bibue reserves the right to reject submissions that violate our content guidelines or do not meet quality standards.</p>
              <p>After a creator's first 3 chapters are individually approved, subsequent chapters may be auto-published, subject to periodic quality reviews.</p>
            </Section>

            <Section title="4. Creative Control & Intellectual Property">
              <p><strong className="text-foreground">You retain 100% ownership of your intellectual property.</strong> Bibue does not claim ownership over any content you create or upload.</p>
              <p>By publishing on Bibue, you grant us a <strong className="text-foreground">non-exclusive, worldwide, royalty-free license</strong> to host, display, distribute, promote, and monetize your content on the Platform and related marketing channels (social media, newsletters, partner sites) for the duration of your content being published on Bibue.</p>
              <p>You may remove your content at any time. Upon removal, the license terminates within 30 days, except for cached or archived copies necessary for platform operations.</p>
            </Section>

            <Section title="5. Content Rating & Guidelines">
              <p>All content must be accurately tagged with the appropriate content rating:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">All Ages</strong> — Suitable for all readers</li>
                <li><strong className="text-foreground">Teen (13+)</strong> — Mild violence, mild language</li>
                <li><strong className="text-foreground">Mature (17+)</strong> — Strong violence, mature themes, strong language</li>
                <li><strong className="text-foreground">18+ / Adult</strong> — Graphic content, adult themes</li>
              </ul>
              <p className="mt-3">The following content is <strong className="text-destructive">strictly prohibited</strong> regardless of rating:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Content depicting minors in sexual or suggestive situations</li>
                <li>Real-world hate speech, terrorism promotion, or incitement of violence</li>
                <li>AI-generated art or writing (all content must be human-created)</li>
                <li>Content that infringes on third-party copyrights or trademarks</li>
                <li>Misleading content ratings</li>
              </ul>
              <p className="mt-2">Violations may result in content removal, account suspension, or permanent ban. Repeat offenders may forfeit pending earnings.</p>
            </Section>

            <Section title="6. Payment & Taxes">
              <p>Creators are solely responsible for reporting and paying all applicable taxes on earnings received from Bibue. For US-based creators, Bibue will issue a 1099-NEC form for annual earnings exceeding $600 USD. International creators are responsible for complying with their local tax laws.</p>
              <p>Bibue is not a tax advisor and does not provide tax guidance.</p>
            </Section>

            <Section title="7. Referral Program">
              <p>Creators may invite others using their unique referral code (format: BIBUE-XXXXXX). When a referred creator uploads their first approved 3-chapter series, both the referrer and the referred creator receive an additional +5% revenue bonus for 30 days. Abuse of the referral system (self-referrals, fake accounts) will result in forfeiture of bonuses and potential account termination.</p>
            </Section>

            <Section title="8. Termination">
              <p>Either party may terminate this Agreement at any time. You may delete your account and remove your content from Bibue at will. Bibue may terminate your account for violations of this Agreement, with or without prior notice for severe violations.</p>
              <p>Upon termination, any outstanding earned revenue will be paid out within 60 days, provided no violations have occurred. Bibue may withhold final payouts if fraudulent activity is suspected, pending investigation.</p>
            </Section>

            <Section title="9. DMCA & Copyright">
              <p>Bibue respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted work has been infringed, you may submit a DMCA takedown request through our Support page.</p>
              <p>Creators who receive valid DMCA complaints against their content will be notified and given an opportunity to file a counter-notice. Repeat copyright infringers will have their accounts permanently terminated.</p>
            </Section>

            <Section title="10. Indemnification">
              <p>You agree to indemnify and hold harmless Bibue, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising from your content, your use of the Platform, or your violation of this Agreement.</p>
            </Section>

            <Section title="11. Limitation of Liability">
              <p>To the maximum extent permitted by law, Bibue shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loss of revenue, data, or business opportunities. Bibue's total liability shall not exceed the total amount paid to you in the 12 months preceding the claim.</p>
            </Section>

            <Section title="12. Privacy & Data">
              <p>Your personal information (legal name, email, payment details) is collected solely for account management, payouts, and legal compliance. We do not sell your personal data to third parties. Your public display name and creator profile are visible to readers. For full details, see our <a href="/privacy" className="text-[#7C3AED] underline hover:text-[#7C3AED]/80">Privacy Policy</a>.</p>
            </Section>

            <Section title="13. Governing Law & Dispute Resolution">
              <p>This Agreement is governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes arising from this Agreement shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in San Francisco, California, under the rules of the American Arbitration Association (AAA). You waive the right to participate in class-action lawsuits.</p>
            </Section>

            <Section title="14. Updates to Terms">
              <p>Bibue reserves the right to modify this Agreement at any time. Material changes will be communicated via email and/or platform notification at least 30 days before taking effect. Continued use of the Platform after changes take effect constitutes acceptance of the updated terms. If you disagree with changes, you may terminate your account before the effective date.</p>
            </Section>

            <Section title="15. Entire Agreement">
              <p>This Agreement constitutes the entire agreement between you and Bibue regarding your use of the Platform as a creator and supersedes all prior agreements, representations, and understandings.</p>
            </Section>

            <p className="pt-4 text-xs text-muted-foreground/70">
              © 2026 Bibue. All rights reserved. Questions? Contact us at <a href="/support" className="text-[#7C3AED] underline">Support</a>.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}
