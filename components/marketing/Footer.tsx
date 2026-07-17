import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const CONTACT_EMAIL = "jesus@saguarodigitalventures.com";

export function Footer() {
  return (
    <footer className="border-t bg-card/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
              Contact
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-1.5 border-t pt-6 text-xs leading-relaxed text-muted-foreground">
          <p>© 2026 Saguaro Digital Ventures LLC. Monte Estate is owned and operated by Saguaro Digital Ventures LLC.</p>
          <p>
            Monte Estate provides educational investment analysis tools and does not provide financial, legal,
            tax, or investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
