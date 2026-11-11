import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FloatingBackdrop } from "@/components/Decor";

export const metadata: Metadata = {
  title: "Evelyn Cards",
  description: "Pink flashcards made with love, for reviewing anything.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffe6f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FloatingBackdrop />
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
