import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  applicationName: "Green Mile",
  title: { default: "Green Mile", template: "%s · Green Mile" },
  description: "US green-card presence & travel-compliance tracker.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Green Mile", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#0a0e15" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const c = cookies().get("gm-theme")?.value;
  const theme: "dark" | "light" = c === "light" ? "light" : "dark";

  return (
    <html lang="en" data-theme={theme} className={jetbrainsMono.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
