"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** หน้า error กลาง — จับ error ที่ไม่คาดคิดของทุกหน้า แสดงเป็นภาษาไทยแทนจอพัง */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </span>
      <h1 className="text-2xl font-bold">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        ระบบเจอปัญหาที่ไม่คาดคิด ลองกดโหลดใหม่ดูก่อน
        ถ้ายังพังอยู่ช่วยแจ้งทีมคอมพิวเตอร์ผ่านเมนู &quot;แจ้งปัญหา&quot; ทีนะครับ
      </p>
      <div className="flex gap-2">
        <Button variant="dark" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          ลองใหม่
        </Button>
        <Link href="/">
          <Button variant="outline">กลับหน้าแรก</Button>
        </Link>
      </div>
    </div>
  );
}
