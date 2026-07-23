"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useDepartments } from "@/lib/queries";
import {
  collectErrors,
  email,
  matches,
  minLength,
  required,
  runRules,
} from "@/lib/validation";

const positions = ["เจ้าหน้าที่", "พยาบาล", "แพทย์", "นักเทคนิคการแพทย์", "อื่น ๆ"];

type FieldName =
  | "employee_no"
  | "fname"
  | "lname"
  | "email"
  | "username"
  | "password"
  | "confirm_password"
  | "dept_id"
  | "position"
  | "accept";

type Errors = Partial<Record<FieldName, string>>;

const initialValues = {
  employee_no: "",
  fname: "",
  lname: "",
  email: "",
  username: "",
  password: "",
  confirm_password: "",
  dept_id: "",
  position: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const departments = useDepartments();
  const [values, setValues] = useState(initialValues);
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function setValue(name: keyof typeof initialValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors<FieldName>({
      employee_no: runRules(
        values.employee_no,
        required("กรุณากรอกเลขประจำตัวพนักงาน"),
      ),
      fname: runRules(values.fname, required("กรุณากรอกชื่อ")),
      lname: runRules(values.lname, required("กรุณากรอกนามสกุล")),
      email: runRules(values.email, required("กรุณากรอกอีเมล"), email()),
      username: runRules(
        values.username,
        required("กรุณากรอกชื่อผู้ใช้งาน"),
        minLength(4, "ชื่อผู้ใช้งานต้องมีอย่างน้อย 4 ตัวอักษร"),
      ),
      password: runRules(
        values.password,
        required("กรุณากรอกรหัสผ่าน"),
        minLength(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
      ),
      confirm_password: runRules(
        values.confirm_password,
        required("กรุณายืนยันรหัสผ่าน"),
        matches(values.password, "รหัสผ่านไม่ตรงกัน"),
      ),
      dept_id: runRules(values.dept_id, required("กรุณาเลือกแผนก/ฝ่าย")),
      position: runRules(values.position, required("กรุณาเลือกตำแหน่ง")),
      accept: accept ? null : "กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก",
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.accept) {
        toast.error("ยังสมัครสมาชิกไม่ได้", nextErrors.accept);
      }
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        employee_no: values.employee_no.trim(),
        fname: values.fname.trim(),
        lname: values.lname.trim(),
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
        dept_id: values.dept_id,
        position: values.position,
      });
      toast.success(
        "สมัครสมาชิกสำเร็จ",
        "เข้าสู่ระบบด้วยบัญชีที่สร้างไว้ได้เลย",
      );
      router.push("/login");
    } catch (err) {
      toast.error("สมัครสมาชิกไม่สำเร็จ", getApiErrorMessage(err));
      setSubmitting(false);
    }
  }

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

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="เลขประจำตัวพนักงาน"
            required
            htmlFor="employee_no"
            error={errors.employee_no}
          >
            <Input
              id="employee_no"
              name="employee_no"
              placeholder="กรอกเลขประจำตัวพนักงาน"
              value={values.employee_no}
              onChange={(e) => setValue("employee_no", e.target.value)}
              aria-invalid={!!errors.employee_no}
              className={fieldInvalidClass(errors.employee_no)}
              disabled={submitting}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="ชื่อ" required htmlFor="fname" error={errors.fname}>
              <Input
                id="fname"
                name="fname"
                placeholder="กรอกชื่อ"
                value={values.fname}
                onChange={(e) => setValue("fname", e.target.value)}
                aria-invalid={!!errors.fname}
                className={fieldInvalidClass(errors.fname)}
                disabled={submitting}
              />
            </FormField>
            <FormField
              label="นามสกุล"
              required
              htmlFor="lname"
              error={errors.lname}
            >
              <Input
                id="lname"
                name="lname"
                placeholder="กรอกนามสกุล"
                value={values.lname}
                onChange={(e) => setValue("lname", e.target.value)}
                aria-invalid={!!errors.lname}
                className={fieldInvalidClass(errors.lname)}
                disabled={submitting}
              />
            </FormField>
          </div>

          <FormField
            label="อีเมล (Email)"
            required
            htmlFor="email"
            error={errors.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@hospsrisuk.go.th"
              autoComplete="email"
              value={values.email}
              onChange={(e) => setValue("email", e.target.value)}
              aria-invalid={!!errors.email}
              className={fieldInvalidClass(errors.email)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="ชื่อผู้ใช้งาน (Username)"
            required
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
                value={values.username}
                onChange={(e) => setValue("username", e.target.value)}
                aria-invalid={!!errors.username}
                disabled={submitting}
              />
            </div>
          </FormField>

          <FormField
            label="รหัสผ่าน (Password)"
            required
            htmlFor="password"
            error={errors.password}
            hint="อย่างน้อย 8 ตัวอักษร"
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className={`pl-9 pr-10 ${fieldInvalidClass(errors.password)}`}
                autoComplete="new-password"
                value={values.password}
                onChange={(e) => setValue("password", e.target.value)}
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

          <FormField
            label="ยืนยันรหัสผ่าน (Confirm Password)"
            required
            htmlFor="confirm_password"
            error={errors.confirm_password}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm_password"
                name="confirm_password"
                type={showConfirm ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                className={`pl-9 pr-10 ${fieldInvalidClass(errors.confirm_password)}`}
                autoComplete="new-password"
                value={values.confirm_password}
                onChange={(e) => setValue("confirm_password", e.target.value)}
                aria-invalid={!!errors.confirm_password}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="แสดง/ซ่อนรหัสผ่าน"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="แผนก/ฝ่าย"
              required
              htmlFor="dept_id"
              error={errors.dept_id}
              hint={
                departments.isError
                  ? "โหลดรายชื่อแผนกไม่สำเร็จ กรุณารีเฟรชหน้า"
                  : undefined
              }
            >
              <Select
                id="dept_id"
                name="dept_id"
                value={values.dept_id}
                onChange={(e) => setValue("dept_id", e.target.value)}
                aria-invalid={!!errors.dept_id}
                className={`h-11 ${fieldInvalidClass(errors.dept_id)}`}
                disabled={submitting || departments.isLoading}
              >
                <option value="" disabled>
                  {departments.isLoading
                    ? "กำลังโหลดรายชื่อแผนก..."
                    : "เลือกแผนก/ฝ่าย"}
                </option>
                {departments.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.dept_name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label="ตำแหน่ง"
              required
              htmlFor="position"
              error={errors.position}
            >
              <Select
                id="position"
                name="position"
                value={values.position}
                onChange={(e) => setValue("position", e.target.value)}
                aria-invalid={!!errors.position}
                className={`h-11 ${fieldInvalidClass(errors.position)}`}
                disabled={submitting}
              >
                <option value="" disabled>
                  เลือกตำแหน่ง
                </option>
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={accept}
                onChange={(e) => {
                  setAccept(e.target.checked);
                  if (errors.accept)
                    setErrors((prev) => ({ ...prev, accept: undefined }));
                }}
                className="h-4 w-4 rounded border-input accent-[var(--primary)]"
              />
              ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
            </label>
            {errors.accept && (
              <p className="mt-1.5 text-sm text-destructive animate-field-error">
                {errors.accept}
              </p>
            )}
          </div>

          <Button
            variant="dark"
            size="lg"
            className="w-full"
            type="submit"
            loading={submitting}
          >
            {!submitting && <UserPlus className="h-4 w-4" />}
            {submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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
