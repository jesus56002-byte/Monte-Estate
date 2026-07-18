"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, Mail, MessageSquareText, Scale, ScrollText, ShieldQuestion } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitFeedback, type SettingsActionState } from "@/app/(app)/settings/actions";

const CONTACT_EMAIL = "jesus@saguarodigitalventures.com";
const initialState: SettingsActionState = { error: null, success: null };

const FAQS = [
  {
    q: "How accurate is the property data?",
    a: "Property details, value, and rent estimates come from RentCast's public data and automated valuation models. They're a strong starting point, but always confirm exact numbers — taxes, HOA, condition, and rent — before making a decision.",
  },
  {
    q: "What does the Monte Carlo simulation actually show?",
    a: "Instead of one guess at appreciation, rent growth, and vacancy, we run 10,000 randomized trials across a realistic range of outcomes and show you the worst, median, and best case. It's a way to see the range of possibilities, not a prediction of what will happen.",
  },
  {
    q: "How many analyses do I get each month?",
    a: "Free includes 3 analyses total. Starter includes 20/month and Investor includes 60/month, both resetting on your billing date. Need more? Buy a 10-pack top-up anytime from Settings > Subscription.",
  },
  {
    q: "Can I change or cancel my plan anytime?",
    a: "Yes — upgrade, downgrade, or cancel anytime from Settings > Subscription. Cancellations take effect at the end of your current billing period, and you keep full access until then.",
  },
  {
    q: "Is my data secure?",
    a: "Your account and saved deals are stored in Supabase with row-level security, so only you can access them. Payments are handled entirely by Stripe — we never see or store your card details. We don't sell your data.",
  },
  {
    q: "Does Monte Estate give financial advice?",
    a: "No. Monte Estate is an educational analysis tool, not a financial, legal, tax, or investment advisor. Always verify third-party data and consult a licensed professional before making an investment decision.",
  },
];

function ContactSupportCard() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Contact Support</p>
          <p className="text-sm text-muted-foreground">Need help? Email us anytime.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-medium text-primary underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function FaqCard() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldQuestion className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-sm font-semibold">FAQ</p>
          <p className="mb-2 text-sm text-muted-foreground">Common questions.</p>
          <div className="flex flex-col divide-y">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-3 first:pt-0 last:pb-0">
                <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
                  <span className="mr-1 inline-block transition-transform duration-200 group-open:rotate-90">
                    ›
                  </span>
                  {item.q}
                </summary>
                <p className="mt-2 pl-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: typeof Scale;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} target="_blank">
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-soft-lg">
        <CardContent className="flex items-center gap-4 pt-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DisclaimerCard() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 pt-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Scale className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">Disclaimer</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Monte Estate provides educational investment analysis tools and does not provide financial,
            legal, tax, or investment advice. Third-party real estate data is subject to errors — always
            verify results independently. Monte Carlo simulation results are not a guarantee of any
            outcome.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackCard() {
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquareText className="size-4.5 text-primary" />
          Feedback
        </CardTitle>
        <CardDescription>Found a bug? Have a feature request? We read every message.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              defaultValue="bug"
              className="h-10 w-full rounded-xl border border-input bg-transparent px-3.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="bug">Bug report</option>
              <option value="feature">Feature request</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="What's on your mind?"
            />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state.success && <p className="text-sm text-success">{state.success}</p>}

          <Button type="submit" className="w-fit" disabled={pending}>
            {pending ? "Sending…" : "Send Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function HelpSection() {
  return (
    <div className="flex flex-col gap-4">
      <ContactSupportCard />
      <FaqCard />
      <LinkCard icon={Lock} title="Privacy Policy" description="How we handle your data." href="/privacy" />
      <LinkCard icon={ScrollText} title="Terms of Service" description="The rules for using Monte Estate." href="/terms" />
      <DisclaimerCard />
      <FeedbackCard />
    </div>
  );
}
