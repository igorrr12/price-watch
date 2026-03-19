import "./../styles/globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { AdSenseScript } from "@/components/AdSense";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { Logo } from "@/components/Logo";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: {
    default: "Price Watch - Reliable Price Tracker for Amazon, ASOS & Zara",
    template: "%s | Price Watch"
  },
  description: "Save money on Amazon, ASOS, and Zara with Price Watch. Set your target price and get instant email alerts when prices drop. Simple and reliable price tracking.",
  keywords: ["price tracker", "amazon price alerts", "price drop monitor", "save money", "shopping tracker"],
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.png", sizes: "480x480", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pricewatch.top",
    siteName: "Price Watch",
    images: [{
      url: "/logo.png",
      width: 500,
      height: 500,
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pricewatch.top"
      }
    ]
  };

  return (
    <html lang="en" className={outfit.variable}>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <body className="font-outfit min-h-screen flex flex-col bg-cream text-charcoal selection:bg-brand selection:text-white">
        <header className="border-b-2 border-charcoal bg-white px-4 py-1.5 shadow-retro-sm lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="block w-40 shrink-0 lg:w-52">
                <Logo className="h-auto w-full transition-transform hover:scale-105" />
              </Link>
              <span className="hidden text-sm font-medium tracking-wider text-charcoal/60 md:inline-block uppercase tracking-widest">
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

        <footer className="mt-12 border-t-2 border-charcoal bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand Col */}
              <div className="space-y-6">
                <Link href="/" className="block w-48">
                  <Logo className="h-auto w-full" />
                </Link>
                <p className="max-w-xs text-sm font-medium leading-relaxed text-charcoal/60">
                  The most reliable price tracker for your favorite retailers. Save money with instant price drop alerts delivered straight to your inbox.
                </p>
              </div>

              {/* Stores Col */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-charcoal">Supported Stores</h4>
                <ul className="mt-6 space-y-4 text-sm font-bold text-charcoal/60">
                  <li><span className="cursor-default hover:text-brand transition-colors">Amazon Global</span></li>
                  <li><span className="cursor-default hover:text-brand transition-colors">ASOS</span></li>
                  <li><span className="cursor-default hover:text-brand transition-colors">Zara</span></li>
                  <li><span className="text-[10px] uppercase bg-brand/10 text-brand px-2 py-0.5 rounded">More coming soon</span></li>
                </ul>
              </div>

              {/* Legal Col */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-charcoal">Information</h4>
                <ul className="mt-6 space-y-4 text-sm font-bold text-charcoal/60">
                  <li>
                    <Link href="/privacy" className="hover:text-brand transition-colors">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-brand transition-colors">Terms of Service</Link>
                  </li>
                  <li>
                    <a href="mailto:support@pricewatch.top" className="hover:text-brand transition-colors">Contact Support</a>
                  </li>
                </ul>
              </div>

              {/* Social/Copyright Col */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-charcoal">Connect</h4>
                <p className="mt-6 text-sm font-bold text-charcoal/60">
                  Follow us for updates and shopping tips.
                </p>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
                  &copy; {new Date().getFullYear()} PRICE WATCH.<br />
                  ALL RIGHTS RESERVED.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
