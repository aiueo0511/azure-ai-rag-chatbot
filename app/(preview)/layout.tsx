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
          {/* 日本語の注意書きを追加 */}
          <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
            <h2>注意事項</h2>
            <p>個人情報や機密情報を入力しないでください。</p>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

