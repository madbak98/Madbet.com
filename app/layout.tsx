import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Unbounded } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "MADBAK HOUSE — Demo Casino Experience",
  description: "A cinematic fake-coin casino interface built as an immersive portfolio project.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${unbounded.variable}`}>
      <body className="min-h-screen bg-[#050505] text-[#F2E3C6] antialiased">{children}</body>
    </html>
  );
}
