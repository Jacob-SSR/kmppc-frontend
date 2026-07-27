import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

/** หน้า 404 กลางของระบบ — ลิงก์เสีย/พิมพ์ URL ผิด */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
        <SearchX className="h-8 w-8 text-primary" />
      </span>
      <h1 className="text-2xl font-bold">ไม่พบหน้าที่คุณต้องการ (404)</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        หน้านี้อาจถูกลบไปแล้ว หรือลิงก์ที่พิมพ์มาไม่ถูกต้อง
        ลองกลับไปเริ่มที่หน้าแรกดูนะครับ
      </p>
      <Link href="/">
        <Button variant="dark">กลับหน้าแรก</Button>
      </Link>
    </div>
  );
}
