import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Price Watch - Track Prices on Amazon, ASOS & Zara",
  description: "Save money on Amazon, ASOS, and Zara with Price Watch. Set your target price and get instant email alerts when prices drop. Simple and reliable price tracking.",
  keywords: ["price tracker", "amazon price alerts", "price drop monitor", "save money", "shopping tracker"],
  openGraph: {
    title: "Price Watch - Price Tracker for Amazon, ASOS & Zara",
    description: "Track prices and save money on Amazon, ASOS, and Zara with email alerts.",
    url: "https://pricewatch.top",
    siteName: "Price Watch",
    images: [{
      url: "/logo.png",
      width: 500,
      height: 500,
    }],
    type: "website",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
