import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://monte.estate"),
  title: {
    default: "Monte Estate — Real Estate Investment Analysis & Monte Carlo Simulation",
    template: "%s — Monte Estate",
  },
  description:
    "Analyze real estate investments in seconds. Enter an address for real property data or build a custom scenario, then get instant cash flow, cap rate, IRR, and a 10,000-trial Monte Carlo simulation with an AI-generated read on the deal.",
  alternates: {
    canonical: "/",
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
        <Analytics />
      </body>
    </html>
  );
}
