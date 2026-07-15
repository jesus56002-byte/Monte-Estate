import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TERMS_VERSION } from "@/lib/terms";

export const metadata = {
  title: "Terms & Conditions — Monte Estate",
};

const EFFECTIVE_DATE = "July 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="font-semibold tracking-tight">
          Monte Estate
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground">Effective {EFFECTIVE_DATE} · Version {TERMS_VERSION}</p>
        </div>

        <Section title="1. Not financial, investment, legal, or tax advice">
          <p>
            Monte Estate is an educational and informational tool for exploring real estate
            investment scenarios. Nothing on this site — including property data, calculated
            metrics (cash flow, cap rate, cash-on-cash return, IRR, total profit), Monte Carlo
            simulation results, or AI-generated interpretations — constitutes financial,
            investment, legal, tax, or professional advice of any kind. Monte Estate is not a
            licensed real estate broker, financial advisor, accountant, or attorney, and using
            this service does not create any advisory, fiduciary, or professional relationship
            between you and Monte Estate.
          </p>
        </Section>

        <Section title="2. You are responsible for verifying everything">
          <p>
            You are solely responsible for independently verifying all property details,
            valuations, rent estimates, financing assumptions, and calculated results before
            relying on them for any purpose, and before making any offer, purchase, financing,
            or other real estate decision. Always confirm figures directly with primary sources
            (the seller, listing agent, county records, lender, insurer, etc.) and consult
            qualified, licensed professionals — a real estate agent or broker, attorney,
            accountant, and financial advisor — before acting on anything shown here.
          </p>
        </Section>

        <Section title="3. Third-party data may be inaccurate or outdated">
          <p>
            Property characteristics, valuation estimates, and rent estimates are sourced from
            third-party data providers (currently RentCast) and automated valuation models. This
            data is provided &quot;as is,&quot; may be incomplete, outdated, or simply wrong, and is not
            verified by Monte Estate. Automated valuation models are statistical estimates, not
            appraisals, and can differ substantially from actual market value or achievable rent.
          </p>
        </Section>

        <Section title="4. AI-generated content may be inaccurate">
          <p>
            The &quot;AI interpretation&quot; feature uses a third-party large language model (Anthropic&apos;s
            Claude) to generate a summary based on the numbers calculated for your inputs. AI-generated
            content can be incomplete, biased, or factually wrong, and does not reflect independent
            analysis, research, or professional judgment. It is a conversational summary of the
            numbers already shown to you, not a recommendation to buy, sell, or hold any property.
          </p>
        </Section>

        <Section title="5. Monte Carlo simulation is not a guarantee">
          <p>
            The Monte Carlo simulation models a range of hypothetical outcomes by randomizing
            assumptions (such as appreciation, rent growth, and vacancy) around the values you
            provide or that were estimated for you. It is a statistical modeling exercise, not a
            forecast, prediction, or guarantee of actual future performance. Worst-case, median,
            and best-case figures — and any probability-of-loss statistic — are outputs of the
            model&apos;s assumptions, not promises about what will happen to any real property.
            Real-world results depend on markets, financing, property condition, management, and
            countless factors the simulation does not and cannot account for, and may be
            significantly better or worse than anything shown. Past or modeled outcomes are not
            indicative of future results.
          </p>
        </Section>

        <Section title="6. No warranty">
          <p>
            Monte Estate is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind,
            whether express, implied, or statutory, including any implied warranties of
            merchantability, fitness for a particular purpose, accuracy, reliability, or
            non-infringement. We do not warrant that the service will be uninterrupted, error-free,
            or secure, or that any defects will be corrected.
          </p>
        </Section>

        <Section title="7. Limitation of liability">
          <p>
            To the maximum extent permitted by law, Monte Estate and its owner(s) will not be
            liable for any direct, indirect, incidental, special, consequential, exemplary, or
            punitive damages — including lost profits, lost investment returns, or other financial
            loss — arising out of or related to your use of, or inability to use, the service, or
            any decision made or action taken in reliance on information provided by the service,
            even if advised of the possibility of such damages. Your use of Monte Estate, and any
            real estate or financial decisions you make, are entirely at your own risk.
          </p>
        </Section>

        <Section title="8. Indemnification">
          <p>
            You agree to indemnify and hold harmless Monte Estate and its owner(s) from any claims,
            losses, liabilities, damages, and expenses (including reasonable legal fees) arising
            from your use of the service, your violation of these terms, or any real estate,
            financial, or other decision you make in connection with your use of the service.
          </p>
        </Section>

        <Section title="9. Subscriptions and billing">
          <p>
            Paid plans are billed on a recurring monthly basis through Stripe. You can cancel or
            change your plan at any time through the billing portal; cancellation takes effect at
            the end of the current billing period. Fees already paid are non-refundable except
            where required by applicable law. One-time top-up purchases are also non-refundable
            once analyses from that purchase have been used.
          </p>
        </Section>

        <Section title="10. Eligibility and account responsibility">
          <p>
            You must be at least 18 years old to create an account. You are responsible for
            maintaining the confidentiality of your account credentials and for all activity that
            occurs under your account.
          </p>
        </Section>

        <Section title="11. Acceptable use">
          <p>
            You agree not to misuse the service — including attempting to circumvent usage limits,
            scraping or bulk-extracting data, reverse engineering the service, or reselling access
            or data obtained through it without authorization.
          </p>
        </Section>

        <Section title="12. Changes to these terms">
          <p>
            We may update these terms from time to time. Continued use of Monte Estate after an
            update constitutes acceptance of the revised terms. Material changes will be reflected
            by a new effective date and version number above.
          </p>
        </Section>

        <Section title="13. Termination">
          <p>
            We may suspend or terminate your access to the service at any time, for any reason,
            including violation of these terms.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>Questions about these terms can be sent to the contact address associated with your account invitation or provided on our homepage.</p>
        </Section>
      </main>
    </div>
  );
}
