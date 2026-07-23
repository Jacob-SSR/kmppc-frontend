"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound, Mail, MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { email as emailRule, required, runRules } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextError = runRules(email, required("กรุณากรอกอีเมล"), emailRule());
    setError(nextError ?? undefined);
    if (nextError) return;

    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
      toast.success("ส่งลิงก์แล้ว", "กรุณาตรวจสอบกล่องจดหมายของคุณ");
    } catch (err) {
      toast.error("ส่งลิงก์ไม่สำเร็จ", getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
            <MailCheck className="h-6 w-6 text-primary" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">ตรวจสอบอีเมลของคุณ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            หากอีเมล <span className="font-medium text-foreground">{email}</span>{" "}
            อยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว
            (ลิงก์มีอายุจำกัด หากไม่พบกรุณาตรวจสอบในโฟลเดอร์สแปม)
          </p>
          <Button
            variant="outline"
            className="mt-6 w-full"
            type="button"
            onClick={() => setSent(false)}
          >
            ส่งอีกครั้ง
          </Button>
          <Link
            href="/login"
            className="mt-4 flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </Card>
      </div>
    );
  }

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

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField label="อีเมล" htmlFor="email" error={error}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="เช่น somchai.c@phlapphlachai-hospital.go.th"
                className={`pl-9 ${fieldInvalidClass(error)}`}
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(undefined);
                }}
                aria-invalid={!!error}
                disabled={submitting}
              />
            </div>
          </FormField>
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            type="submit"
            loading={submitting}
          >
            {!submitting && <Send className="h-4 w-4" />}
            {submitting ? "กำลังส่งลิงก์..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
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
