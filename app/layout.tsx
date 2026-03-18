import "./../styles/globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { AdSenseScript } from "@/components/AdSense";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Logo } from "@/components/Logo";
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: {
    default: "Price Watch - Smart AI Price Tracker",
    template: "%s | Price Watch"
  },
  description: "Track product prices on Amazon, ASOS, and Zara. Get instant AI price drop alerts via email. Save money today with Price Watch.",
  keywords: ["price tracker", "amazon price alerts", "price drop monitor", "save money", "shopping tracker"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pricewatch.top",
    siteName: "Price Watch",
    images: [{
      url: "/og-image.png", // Assuming a generic OG image exists or will be added
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Price Watch - Smart AI Price Tracker",
    description: "Track prices and save money with instant alerts.",
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col bg-cream text-charcoal selection:bg-brand selection:text-white">
        <AdSenseScript />
        <header className="border-b-2 border-charcoal bg-white px-4 py-1.5 shadow-retro-sm lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="block w-40 shrink-0 lg:w-52">
                <Logo className="h-auto w-full transition-transform hover:scale-105" />
              </Link>
              <span className="hidden text-sm font-medium tracking-wider text-charcoal/60 md:inline-block">
                Track drops on Amazon, ASOS & Zara
              </span>
            </div>
            <nav className="flex items-center gap-6 text-lg font-bold tracking-widest text-charcoal sm:text-xl">
              {user ? (
                <>
                  <Link href="/dashboard" className="transition-colors hover:text-brand">
                    Dashboard
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button type="submit" className="transition-colors hover:text-brand focus:outline-none">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="transition-colors hover:text-brand">
                    Login
                  </Link>
                  <Link href="/register" className="transition-colors hover:text-brand">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
          <main className="flex-1">{children}</main>
        </div>

        <footer className="mt-8 border-t-2 border-charcoal py-8">
          <div className="mx-auto w-full max-w-5xl px-4 text-center font-medium text-charcoal/60 sm:text-left">
            &copy; {new Date().getFullYear()} Price Watch.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
