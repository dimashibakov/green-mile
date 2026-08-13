import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Green Mile",
  title: { default: "Green Mile", template: "%s · Green Mile" },
  description: "US green-card presence & travel-compliance tracker.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Green Mile", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = { themeColor: "#0a0e15" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const c = cookies().get("gm-theme")?.value;
  const theme: "dark" | "light" = c === "light" ? "light" : "dark";

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
