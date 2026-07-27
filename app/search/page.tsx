import type { Metadata } from "next";
import { cookies } from "next/headers";
import { hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { PENDING_ADDRESS_COOKIE } from "@/lib/pendingAddress";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { AuthedSearchView } from "@/components/property/AuthedSearchView";
import { AnonymousSearchView } from "@/components/property/AnonymousSearchView";

const TITLE = "Free Property Investment Analysis";
const DESCRIPTION =
  "Search any property address and see estimated value and rent instantly, free, no account required. Create a free account to run the full Monte Carlo simulation.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/search" },
  openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/search" },
  twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
};

/**
 * "Search first, sign up second": this URL serves everyone — an anonymous
 * visitor gets a free property preview with a signup wall only in front of
 * the real analysis (AnonymousSearchView), a signed-in user gets the
 * existing one-step address-to-saved-deal flow (AuthedSearchView),
 * unchanged. Same pattern as MarketingHeader: one URL, auth decides the
 * view, so every existing link to /search keeps working for both.
 */
export default async function SearchPage() {
  if (!hasSupabaseConfig) {
    return (
      <div className="flex flex-1 flex-col">
        <MarketingHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
          <h1 className="text-xl font-semibold">Supabase is not configured yet</h1>
          <p className="max-w-md text-muted-foreground">
            Set the Supabase environment variables to enable property search.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const { user } = await getAuthedUser();

  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />
      <main className="flex flex-1 flex-col">
        {user ? (
          <AuthedSearchView pendingAddress={await getPendingAddress()} />
        ) : (
          <AnonymousSearchView />
        )}
      </main>
      <Footer />
    </div>
  );
}

async function getPendingAddress(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(PENDING_ADDRESS_COOKIE)?.value;
}
