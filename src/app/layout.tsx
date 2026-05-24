import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Horas Claras",
  description: "Mini app para registrar horas y controlar cargas en Jira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){const t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'night':'light');document.documentElement.setAttribute('data-theme',t);})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
