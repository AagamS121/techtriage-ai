import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechTriage AI — Guided Wi-Fi troubleshooting",
  description: "A small evidence-first troubleshooting prototype for Windows 11 Wi-Fi issues after sleep."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
