import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/marketing/Footer";

export const metadata = {
  title: "Privacy Policy — Monte Estate",
};

const EFFECTIVE_DATE = "July 2026";
const PRIVACY_VERSION = "1.0";
const CONTACT_EMAIL = "jesus@saguarodigitalventures.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b bg-card/60 px-6 py-4 backdrop-blur">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective {EFFECTIVE_DATE} · Version {PRIVACY_VERSION}
          </p>
        </div>

        <Section title="1. Who we are">
          <p>
            Monte Estate is owned and operated by Saguaro Digital Ventures LLC (&quot;Monte Estate,&quot;
            &quot;we,&quot; &quot;us&quot;). This policy explains what information we collect when you use
            the site, how we use it, and who we share it with.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>When you create an account, we collect:</p>
          <ul className="list-disc pl-5">
            <li>Your email address and password (password is stored and verified by our authentication provider, never in plain text on our servers).</li>
            <li>Your cell phone number, collected at signup.</li>
          </ul>
          <p>When you use the app, we store:</p>
          <ul className="list-disc pl-5">
            <li>Property addresses you search and the resulting property data.</li>
            <li>The investment assumptions you enter and the results calculated from them.</li>
            <li>Saved deals, Monte Carlo simulation summaries, and AI-generated interpretations tied to your account.</li>
            <li>Basic usage metadata (how many analyses you&apos;ve run, your subscription plan and status).</li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <p>
            We use this information to operate the service: to authenticate you, run the analyses you
            request, save your deals so they&apos;re there when you come back, enforce plan usage limits,
            and process subscription billing.
          </p>
        </Section>

        <Section title="4. Third-party services we use">
          <p>Monte Estate relies on the following third-party providers to operate. Each processes only the data needed to perform its function:</p>
          <ul className="list-disc pl-5">
            <li><strong className="text-foreground">Supabase</strong> — hosts our database and handles authentication (your account credentials and saved data).</li>
            <li><strong className="text-foreground">Stripe</strong> — processes subscription and one-time payments. We never see or store your full payment card details; Stripe handles that directly.</li>
            <li><strong className="text-foreground">RentCast</strong> — supplies property characteristics and automated valuation estimates for the addresses you search.</li>
            <li><strong className="text-foreground">Anthropic (Claude)</strong> — generates the AI interpretation text from the numbers already calculated for your deal.</li>
            <li><strong className="text-foreground">Vercel</strong> — hosts the application.</li>
          </ul>
        </Section>

        <Section title="5. We don't sell your data">
          <p>
            We do not sell your personal information to third parties, and we do not use your data for
            third-party advertising.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            We use only the essential cookies our authentication provider sets to keep you signed in.
            We don&apos;t use third-party advertising or tracking cookies.
          </p>
        </Section>

        <Section title="7. Data retention and deletion">
          <p>
            We retain your account and saved data for as long as your account is active. To request
            deletion of your account and associated data, contact us at the address below.
          </p>
        </Section>

        <Section title="8. Children's privacy">
          <p>Monte Estate is not directed at, and we do not knowingly collect information from, anyone under 18.</p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this policy from time to time. Continued use of Monte Estate after an update
            constitutes acceptance of the revised policy. Material changes will be reflected by a new
            effective date and version number above.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about this policy or your data can be sent to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
