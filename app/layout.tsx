import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const ibmPlexThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบจัดการองค์ความรู้ (KM) — โรงพยาบาลศรีสุข",
  description:
    "แหล่งรวมความรู้ คู่มือ และประสบการณ์ เพื่อพัฒนางานของเราให้ดียิ่งขึ้น ค้นหา แลกเปลี่ยน และเรียนรู้ไปด้วยกัน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
