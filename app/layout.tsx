import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "LetGoNow - Du thuyền cao cấp",
  description: "Đặt du thuyền cao cấp cho chuyến đi của bạn",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
