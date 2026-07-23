"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function PasswordField({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pl-9 pr-10"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="แสดง/ซ่อนรหัสผ่าน"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// จะเชื่อม POST /api/auth/reset-password (token จาก query string) ในสปรินต์ถัดไป
export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">ตั้งรหัสผ่านใหม่</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร
        </p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <PasswordField
            label="รหัสผ่านใหม่"
            name="password"
            placeholder="กรอกรหัสผ่านใหม่"
          />
          <PasswordField
            label="ยืนยันรหัสผ่านใหม่"
            name="confirm_password"
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
          />
          <Button variant="dark" size="lg" className="w-full" type="submit">
            บันทึกรหัสผ่านใหม่
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      </Card>
    </div>
  );
}
