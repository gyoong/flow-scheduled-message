import type { Metadata } from "next";
import { Do_Hyeon, Geist_Mono, Black_Han_Sans } from "next/font/google";
import "./globals.css";

const doHyeon = Do_Hyeon({
  variable: "--font-do-hyeon",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const blackHanSans = Black_Han_Sans({
  variable: "--font-black-han-sans",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Flow 메시지 예약",
  description: "Flow 메신저 메시지 예약 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${doHyeon.variable} ${geistMono.variable} ${blackHanSans.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        {children}
        <footer className="mt-auto py-4 text-center text-xs text-gray-400">
          Built by Chankyung Kim
        </footer>
      </body>
    </html>
  );
}
