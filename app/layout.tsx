import "./../styles/globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { AdSenseScript } from "@/components/AdSense";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: {
    default: "Price Watch - Reliable Price Tracker for Amazon, ASOS & Zara",
    template: "%s | Price Watch"
  },
  description: "Save money on Amazon, ASOS, and Zara with Price Watch. Set your target price and get instant email alerts when prices drop. Simple and reliable price tracking.",
  keywords: ["price tracker", "amazon price alerts", "price drop monitor", "save money", "shopping tracker"],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pricewatch.top",
    siteName: "Price Watch",
    images: [{
      url: "/logo.png",
      width: 1200,
      height: 1200,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Price Watch - Reliable Price Tracker",
    description: "Track prices and save money on Amazon, ASOS, and Zara with email alerts.",
    images: ["/logo.png"]
  },
  verification: {
    google: "ZLUpdohjvys6G0-P7WnV9yZbZST_mkX-rceard7iZ6g"
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7770398139421078" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://pricewatch.top",
              "logo": "https://pricewatch.top/logo.png"
            })
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-cream text-charcoal selection:bg-brand selection:text-white">
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
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between px-4 font-medium text-charcoal/60 sm:flex-row">
            <div>
              &copy; {new Date().getFullYear()} Price Watch.
            </div>
            <div className="mt-4 flex gap-6 sm:mt-0">
              <Link href="/privacy" className="transition-colors hover:text-charcoal hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-charcoal hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
