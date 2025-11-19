import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TariffAgent - UAE Customs Classification Assistant",
  description: "AI-powered HS code classification for UAE customs and trade. Get accurate tariff classifications with CEPA benefits analysis.",
  keywords: ["UAE customs", "HS code", "tariff classification", "CEPA", "GCC tariff", "trade compliance"],
  authors: [{ name: "TariffAgent" }],
  openGraph: {
    title: "TariffAgent - UAE Customs Classification Assistant",
    description: "AI-powered HS code classification for UAE customs and trade",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
