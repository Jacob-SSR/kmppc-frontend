"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const departments = [
  "แผนกเทคโนโลยีสารสนเทศ",
  "แผนกผู้ป่วยนอก",
  "แผนกห้องปฏิบัติการ",
  "แผนกรังสีวิทยา",
  "แผนกเภสัชกรรม",
  "แผนกทรัพยากรบุคคล",
];

const positions = ["เจ้าหน้าที่", "พยาบาล", "แพทย์", "นักเทคนิคการแพทย์", "อื่น ๆ"];

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({
  name,
  placeholder,
  autoComplete,
}: {
  name: string;
  placeholder: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="pl-9 pr-10"
        autoComplete={autoComplete}
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
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="py-6 text-center">
        <h1 className="text-3xl font-bold text-primary-dark">
          สร้างบัญชีผู้ใช้งาน
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          สมัครสมาชิกเพื่อเข้าถึงแหล่งรวมความรู้
          <br />
          และการทำงานร่วมกันในองค์กร
        </p>
      </div>

      <Card className="p-8">
        <h2 className="font-bold text-primary-dark">ข้อมูลผู้ใช้งาน</h2>

        <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="เลขประจำตัวพนักงาน" required>
            <Input name="employee_no" placeholder="กรอกเลขประจำตัวพนักงาน" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อ" required>
              <Input name="fname" placeholder="กรอกชื่อ" />
            </Field>
            <Field label="นามสกุล" required>
              <Input name="lname" placeholder="กรอกนามสกุล" />
            </Field>
          </div>

          <Field label="อีเมล (Email)" required>
            <Input
              name="email"
              type="email"
              placeholder="name@hospsrisuk.go.th"
              autoComplete="email"
            />
          </Field>

          <Field label="ชื่อผู้ใช้งาน (Username)" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="username"
                placeholder="กรอกชื่อผู้ใช้งาน"
                className="pl-9"
                autoComplete="username"
              />
            </div>
          </Field>

          <Field label="รหัสผ่าน (Password)" required>
            <PasswordInput
              name="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autoComplete="new-password"
            />
          </Field>

          <Field label="ยืนยันรหัสผ่าน (Confirm Password)" required>
            <PasswordInput
              name="confirm_password"
              placeholder="ยืนยันรหัสผ่าน"
              autoComplete="new-password"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="แผนก/ฝ่าย" required>
              <select
                name="dept"
                defaultValue=""
                className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  เลือกแผนก/ฝ่าย
                </option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="ตำแหน่ง" required>
              <select
                name="position"
                defaultValue=""
                className="flex h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  เลือกตำแหน่ง
                </option>
                {positions.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-[var(--primary)]"
            />
            ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
          </label>

          <Button variant="dark" size="lg" className="w-full" type="submit">
            สมัครสมาชิก
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </Card>
    </div>
  );
}
