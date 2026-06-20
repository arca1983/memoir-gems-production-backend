import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memoir Gems — Production Backend",
  description: "Internal production backend for Memoir Gems. Not customer-facing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
