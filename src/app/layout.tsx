import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "HDYU — Harmony Development & Yield Utility",
    template: "%s | HDYU",
  },
  description:
    "HDYU is a Solana Token-2022 utility token powering a green ecosystem: environmental activities, natural farming, sustainable products, travel and partner merchants.",
  keywords: ["HDYU", "Solana", "Token-2022", "green ecosystem", "utility token", "sustainability"],
  openGraph: {
    title: "HDYU — Harmony Development & Yield Utility",
    description: "Earn HDYU through verified green activities. Use it across a growing eco-friendly ecosystem.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
