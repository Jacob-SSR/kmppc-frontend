"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AlertTriangle, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  collectErrors,
  matches,
  minLength,
  required,
  runRules,
} from "@/lib/validation";

type Errors = Partial<Record<"password" | "confirm_password", string>>;

function PasswordField({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <FormField label={label} htmlFor={name} error={error}>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`pl-9 pr-10 ${fieldInvalidClass(error)}`}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          disabled={disabled}
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
    </FormField>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <Card className="w-full max-w-md p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">ลิงก์ไม่ถูกต้อง</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ลิงก์ตั้งรหัสผ่านใหม่ไม่ถูกต้องหรือหมดอายุแล้ว
          กรุณาขอลิงก์ใหม่อีกครั้ง
        </p>
        <Link
          href="/forgot-password"
          className={buttonVariants({
            variant: "dark",
            size: "lg",
            className: "mt-6 w-full",
          })}
        >
          ขอลิงก์ใหม่
        </Link>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      password: runRules(
        password,
        required("กรุณากรอกรหัสผ่านใหม่"),
        minLength(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
      ),
      confirm_password: runRules(
        confirm,
        required("กรุณายืนยันรหัสผ่านใหม่"),
        matches(password, "รหัสผ่านไม่ตรงกัน"),
      ),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success(
        "ตั้งรหัสผ่านใหม่สำเร็จ",
        "เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย",
      );
      router.push("/login");
    } catch (err) {
      toast.error("ตั้งรหัสผ่านใหม่ไม่สำเร็จ", getApiErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
        <ShieldCheck className="h-6 w-6 text-primary" />
      </span>
      <h1 className="mt-4 text-2xl font-bold">ตั้งรหัสผ่านใหม่</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        <PasswordField
          label="รหัสผ่านใหม่"
          name="password"
          placeholder="กรอกรหัสผ่านใหม่"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          disabled={submitting}
        />
        <PasswordField
          label="ยืนยันรหัสผ่านใหม่"
          name="confirm_password"
          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            if (errors.confirm_password)
              setErrors((prev) => ({ ...prev, confirm_password: undefined }));
          }}
          error={errors.confirm_password}
          disabled={submitting}
        />
        <Button
          variant="dark"
          size="lg"
          className="w-full"
          type="submit"
          loading={submitting}
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </p>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
