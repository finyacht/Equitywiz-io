import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Equity-Wiz.io | Financial Modeling Tools",
  description: "A curated collection of web-based financial calculators and models. Curated by Amal Ganatra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RT0B6NXFG6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RT0B6NXFG6');
          `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] text-[#1e293b]`}>
        <Navbar />
        <main className="flex-grow flex flex-col pb-16">{children}</main>
      </body>
    </html>
  );
}

