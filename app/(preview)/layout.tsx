import type { Metadata } from "next";
import { ThemeProvider } from 'next-themes'

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-rag.vercel.app"),
  title: "町の深ぼり",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

