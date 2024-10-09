// "use client"

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./component/Header";
import Footer from "./component/Footer";
// import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free Board",
  description: "Free Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header/>
          <div className="body_children">
          </div>
          <div className="body_main">
            {children}
          </div>
        {/* <SessionProvider>{children}</SessionProvider> */}
        <Footer/>
      </body>
    </html>
  );
}
