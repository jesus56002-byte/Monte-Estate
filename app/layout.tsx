import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { MetaPixel } from "@/components/analytics/MetaPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = "Monte Estate — Real Estate Investment Analysis Tool";
const DESCRIPTION =
  "Analyze real estate investments in seconds — cash flow, cap rate, IRR, and a 10,000-trial Monte Carlo simulation with an AI-generated read on every deal.";

export const metadata: Metadata = {
  metadataBase: new URL("https://monte.estate"),
  title: {
    default: TITLE,
    template: "%s — Monte Estate",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://monte.estate",
    siteName: "Monte Estate",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  verification: {
    other: {
      "facebook-domain-verification": "8wckko82r4hjzcbny62vfpkfavfbws",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <PageViewTracker />
        <MetaPixel />
        <Analytics />
      </body>
    </html>
  );
}
