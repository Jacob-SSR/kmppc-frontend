"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  IdCard,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Save,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useMe, type Me } from "@/lib/queries";
import { collectErrors, required, runRules } from "@/lib/validation";

type Errors = Partial<Record<"fname" | "lname", string>>;

function ProfileContent({ user: u }: { user: Me }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fname: u.fname,
    lname: u.lname,
    display_name: u.display_name ?? "",
    phone: u.phone ?? "",
    position: u.position ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const saveMutation = useMutation({
    mutationFn: async () =>
      api.patch("/users/me", {
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        // ส่งค่าว่างได้ = กลับไปแสดงชื่อจริง
        display_name: form.display_name.trim(),
        phone: form.phone.trim() || undefined,
        position: form.position.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("บันทึกข้อมูลแล้ว");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => toast.error("บันทึกไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () =>
      api.post("/auth/forgot-password", { email: u.email }),
    onSuccess: () =>
      toast.success("ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว", `กรุณาตรวจสอบอีเมล ${u.email}`),
    onError: (err) => toast.error("ส่งลิงก์ไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => api.post("/auth/logout-all"),
    onSuccess: () => {
      queryClient.clear();
      toast.success("ออกจากระบบแล้ว");
      router.push("/login");
    },
    onError: (err) => toast.error("ออกจากระบบไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      fname: runRules(form.fname, required("กรุณากรอกชื่อ")),
      lname: runRules(form.lname, required("กรุณากรอกนามสกุล")),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    saveMutation.mutate();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* บัตรโปรไฟล์ */}
      <Card className="p-6 text-center">
        <Avatar name={u.display_name || u.fname} size="lg" className="mx-auto" />
        <p className="mt-3 font-bold">{u.display_name || `${u.fname} ${u.lname}`}</p>
        {u.display_name && (
          <p className="text-xs text-muted-foreground">
            ชื่อจริง: {u.fname} {u.lname}
          </p>
        )}
        <p className="text-sm text-muted-foreground">{u.position}</p>
        <Badge variant="primary" className="mt-2 gap-1">
          <ShieldCheck className="h-3 w-3" />
          {u.role.role_name === "ADMIN" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}
        </Badge>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-left text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <IdCard className="h-4 w-4 shrink-0 text-primary" />
            {u.employee_no}
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            {u.department.dept_name}
          </p>
          <p className="flex items-center gap-2 break-all text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            {u.email}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-5 w-full text-destructive hover:bg-destructive/5"
          onClick={() => logoutMutation.mutate()}
          loading={logoutMutation.isPending}
        >
          {!logoutMutation.isPending && <LogOut className="h-4 w-4" />}
          ออกจากระบบทุกอุปกรณ์
        </Button>
      </Card>

      <div className="space-y-6">
        {/* แก้ไขข้อมูลส่วนตัว */}
        <Card className="p-6">
          <h2 className="font-bold">แก้ไขข้อมูลส่วนตัว</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submit} noValidate>
            <FormField
              label="ชื่อที่แสดงในเว็บ"
              htmlFor="display_name"
              hint="แสดงตามโพสต์/คอมเมนต์แทนชื่อจริง — เว้นว่างเพื่อใช้ชื่อจริง"
            >
              <Input
                id="display_name"
                placeholder="เช่น หมอต้นไม้, พี่หมี IT"
                value={form.display_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_name: e.target.value }))
                }
                disabled={saveMutation.isPending}
              />
            </FormField>
            <div className="hidden sm:block" />
            <FormField label="ชื่อ" required htmlFor="fname" error={errors.fname}>
              <Input
                id="fname"
                value={form.fname}
                onChange={(e) => {
                  setForm((f) => ({ ...f, fname: e.target.value }));
                  if (errors.fname)
                    setErrors((prev) => ({ ...prev, fname: undefined }));
                }}
                aria-invalid={!!errors.fname}
                className={fieldInvalidClass(errors.fname)}
                disabled={saveMutation.isPending}
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
                value={form.lname}
                onChange={(e) => {
                  setForm((f) => ({ ...f, lname: e.target.value }));
                  if (errors.lname)
                    setErrors((prev) => ({ ...prev, lname: undefined }));
                }}
                aria-invalid={!!errors.lname}
                className={fieldInvalidClass(errors.lname)}
                disabled={saveMutation.isPending}
              />
            </FormField>
            <FormField label="เบอร์โทรศัพท์" htmlFor="phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="pl-9"
                  disabled={saveMutation.isPending}
                />
              </div>
            </FormField>
            <FormField label="ตำแหน่ง" htmlFor="position">
              <Input
                id="position"
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: e.target.value }))
                }
                disabled={saveMutation.isPending}
              />
            </FormField>
            <div className="sm:col-span-2">
              <Button type="submit" loading={saveMutation.isPending}>
                {!saveMutation.isPending && <Save className="h-4 w-4" />}
                {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </div>
          </form>
        </Card>

        {/* เปลี่ยนรหัสผ่าน */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <KeyRound className="h-5 w-5 text-primary" />
            เปลี่ยนรหัสผ่าน
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมล{" "}
            <span className="font-medium text-foreground">{u.email}</span>{" "}
            เพื่อยืนยันตัวตนก่อนเปลี่ยนรหัสผ่าน
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => resetPasswordMutation.mutate()}
            loading={resetPasswordMutation.isPending}
          >
            {!resetPasswordMutation.isPending && (
              <Send className="h-4 w-4 text-primary" />
            )}
            ส่งลิงก์ตั้งรหัสผ่านใหม่
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const me = useMe();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <UserRound className="h-6 w-6 text-primary" />
        โปรไฟล์ของฉัน
      </h1>
      {me.isLoading ? (
        <Card className="mt-6 h-72 animate-pulse bg-muted/50" />
      ) : me.data ? (
        <ProfileContent user={me.data} />
      ) : null}
    </div>
  );
}
