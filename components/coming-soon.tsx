import { Construction } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <Construction className="h-8 w-8 text-primary" />
        </span>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          หน้านี้อยู่ระหว่างการพัฒนา จะเปิดให้ใช้งานในเร็ว ๆ นี้
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
