import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "WJSD Sistemas e Tecnologia | MultiSaaS",
  description: "Sistemas que ajudam pessoas a ajudar pessoas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {
            "try { if (localStorage.getItem('wjsd-theme') === 'light') document.documentElement.classList.add('theme-light'); } catch {}"
          }
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
