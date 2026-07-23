import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-secondary via-background to-accent/60">
      <header className="mx-auto w-full max-w-7xl px-4 py-5 lg:px-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-12 lg:px-6">
        {children}
      </main>
      <footer className="bg-primary-dark py-4 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-white/80 sm:flex-row lg:px-6">
          <span>โรงพยาบาลศรีสุข — ระบบจัดการองค์ความรู้ (KM)</span>
          <span>© 2024 โรงพยาบาลศรีสุข สงวนลิขสิทธิ์</span>
        </div>
      </footer>
    </div>
  );
}
