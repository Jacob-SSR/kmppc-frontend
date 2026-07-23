"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// จะเชื่อม POST /api/auth/forgot-password ในสปรินต์ถัดไป
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          <KeyRound className="h-6 w-6 text-primary" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">ลืมรหัสผ่าน</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้ทางอีเมล
        </p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                name="email"
                placeholder="เช่น somchai.c@srisuk-hospital.go.th"
                className="pl-9"
                autoComplete="email"
              />
            </div>
          </div>
          <Button variant="dark" size="lg" className="w-full" type="submit">
            <Send className="h-4 w-4" />
            ส่งลิงก์ตั้งรหัสผ่านใหม่
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </Card>
    </div>
  );
}
