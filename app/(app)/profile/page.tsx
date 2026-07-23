"use client";

import {
  Building2,
  Camera,
  IdCard,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/lib/mock-data";

// โปรไฟล์ — จะเชื่อม GET /api/auth/me + PATCH /api/users/me ในสปรินต์ถัดไป
export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <UserRound className="h-6 w-6 text-primary" />
        โปรไฟล์ของฉัน
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* บัตรโปรไฟล์ */}
        <Card className="p-6 text-center">
          <div className="relative mx-auto w-fit">
            <Avatar name={currentUser.fname} size="lg" className="mx-auto" />
            <button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
              aria-label="เปลี่ยนรูปโปรไฟล์"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 font-bold">
            {currentUser.fname} {currentUser.lname}
          </p>
          <p className="text-sm text-muted-foreground">{currentUser.position}</p>
          <Badge variant="primary" className="mt-2 gap-1">
            <ShieldCheck className="h-3 w-3" />
            {currentUser.role === "ADMIN" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}
          </Badge>

          <div className="mt-5 space-y-2 border-t border-border pt-4 text-left text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <IdCard className="h-4 w-4 shrink-0 text-primary" />
              {currentUser.employee_no}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0 text-primary" />
              {currentUser.department}
            </p>
            <p className="flex items-center gap-2 break-all text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              {currentUser.email}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-5 w-full text-destructive hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบทุกอุปกรณ์
          </Button>
        </Card>

        <div className="space-y-6">
          {/* แก้ไขข้อมูลส่วนตัว */}
          <Card className="p-6">
            <h2 className="font-bold">แก้ไขข้อมูลส่วนตัว</h2>
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">ชื่อ</label>
                <Input defaultValue={currentUser.fname} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  นามสกุล
                </label>
                <Input defaultValue={currentUser.lname} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input defaultValue={currentUser.phone} className="pl-9" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  ตำแหน่ง
                </label>
                <Input defaultValue={currentUser.position} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">
                  <Save className="h-4 w-4" />
                  บันทึกข้อมูล
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
            <form
              className="mt-4 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  รหัสผ่านปัจจุบัน
                </label>
                <Input type="password" placeholder="กรอกรหัสผ่านปัจจุบัน" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  รหัสผ่านใหม่
                </label>
                <Input type="password" placeholder="อย่างน้อย 8 ตัวอักษร" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <Input type="password" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" />
              </div>
              <div className="sm:col-span-2">
                <Button variant="outline" type="submit">
                  เปลี่ยนรหัสผ่าน
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
