"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, LogIn, MonitorSmartphone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { collectErrors, required, runRules } from "@/lib/validation";

type Errors = Partial<Record<"username" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      username: runRules(username, required("กรุณากรอกชื่อผู้ใช้งาน")),
      password: runRules(password, required("กรุณากรอกรหัสผ่าน")),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await api.post("/auth/login", {
        username: username.trim(),
        password,
        remember,
      });
      toast.success("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับกลับสู่ระบบ KM");
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        "เข้าสู่ระบบไม่สำเร็จ",
        getApiErrorMessage(err, "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"),
      );
      setSubmitting(false);
    }
  }

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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="ชื่อผู้ใช้งาน (Username)"
            htmlFor="username"
            error={errors.username}
          >
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                placeholder="กรอกชื่อผู้ใช้งาน"
                className={`pl-9 ${fieldInvalidClass(errors.username)}`}
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username)
                    setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                aria-invalid={!!errors.username}
                disabled={submitting}
              />
            </div>
          </FormField>

          <FormField
            label="รหัสผ่าน (Password)"
            htmlFor="password"
            error={errors.password}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่าน"
                className={`pl-9 pr-10 ${fieldInvalidClass(errors.password)}`}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={!!errors.password}
                disabled={submitting}
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
          </FormField>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
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

          <Button
            variant="dark"
            size="lg"
            className="w-full"
            type="submit"
            loading={submitting}
          >
            {!submitting && <LogIn className="h-4 w-4" />}
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            หรือ
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            type="button"
            onClick={() =>
              toast.info(
                "ยังไม่เปิดใช้งาน SSO",
                "ระบบ SSO อยู่ระหว่างการพัฒนา กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้งาน",
              )
            }
          >
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
