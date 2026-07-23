"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Lock, MonitorSmartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid flex-1 items-center gap-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <h1 className="text-4xl font-bold text-primary-dark">ยินดีต้อนรับ</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          เข้าสู่ระบบเพื่อเข้าถึงแหล่งรวมความรู้
          และแลกเปลี่ยนประสบการณ์กับเพื่อนร่วมงาน
        </p>
      </div>

      <Card className="mx-auto w-full max-w-md p-8">
        <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="username"
                placeholder="กรอกชื่อผู้ใช้งาน"
                className="pl-9"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่าน"
                className="pl-9 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="แสดง/ซ่อนรหัสผ่าน"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-[var(--primary)]"
              />
              จดจำฉันไว้ในระบบ
            </label>
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <Button variant="dark" size="lg" className="w-full" type="submit">
            เข้าสู่ระบบ
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            หรือ
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" size="lg" className="w-full" type="button">
            <MonitorSmartphone className="h-4 w-4 text-primary" />
            เข้าสู่ระบบด้วย SSO (SSO)
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </Card>
    </div>
  );
}
