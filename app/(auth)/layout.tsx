import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/marketing/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b bg-card/60 px-6 py-4 backdrop-blur">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
