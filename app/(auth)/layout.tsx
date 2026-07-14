import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="font-semibold tracking-tight">
          Monte Estate
        </Link>
        <ThemeToggle />
      </header>
      {children}
    </div>
  );
}
