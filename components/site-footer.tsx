import Link from "next/link";
import { Globe, Mail, MessageCircle } from "lucide-react";
import { HospitalMark } from "@/components/logo";

const footerLinks = [
  { href: "/about", label: "เกี่ยวกับระบบ" },
  { href: "/guide", label: "คู่มือการใช้งาน" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row lg:px-6">
        <div className="flex items-center gap-3">
          <HospitalMark className="bg-white/15" />
          <div className="leading-tight">
            <p className="font-bold">โรงพยาบาลศรีสุข</p>
            <p className="text-xs text-white/70">
              ระบบจัดการองค์ความรู้ (Knowledge Management System)
            </p>
            <p className="text-xs text-white/70">
              © 2024 โรงพยาบาลศรีสุข สงวนลิขสิทธิ์
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/85">
          {footerLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {[MessageCircle, Globe, Mail].map((Icon, i) => (
            <span
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
