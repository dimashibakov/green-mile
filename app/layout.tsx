import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Mile · i-551 migration tracker",
  description: "Residency & travel tracker for U.S. permanent residents.",
};

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
