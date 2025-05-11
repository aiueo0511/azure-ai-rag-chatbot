import type { Metadata } from "next";
import { ThemeProvider } from 'next-themes'

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-rag.vercel.app"),
  title: "AI チャットボット - Azure AI Search と Azure OpenAI を使用して、ベクトルベースの情報検索とテキスト生成を強化した AI チャットボット",
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

