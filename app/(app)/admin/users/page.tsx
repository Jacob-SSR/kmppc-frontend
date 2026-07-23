"use client";

import { Pencil, Search, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminUsers } from "@/lib/mock-data";

// จัดการผู้ใช้งาน — จะเชื่อม GET/POST/PATCH /api/users (ADMIN) ในสปรินต์ถัดไป
export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="ค้นหาชื่อ, username, รหัสพนักงาน..." className="pl-9" />
        </div>
        <Button variant="dark" size="sm">
          <UserPlus className="h-4 w-4" />
          เพิ่มผู้ใช้งาน
        </Button>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">ผู้ใช้งาน</th>
              <th className="px-5 py-3 font-medium">รหัสพนักงาน</th>
              <th className="px-5 py-3 font-medium">แผนก</th>
              <th className="px-5 py-3 font-medium">สิทธิ</th>
              <th className="px-5 py-3 font-medium">สถานะ</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border/60 last:border-0 hover:bg-muted/50"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{u.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {u.employee_no}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {u.department}
                </td>
                <td className="px-5 py-3">
                  <Badge variant={u.role === "ADMIN" ? "primary" : "default"}>
                    {u.role === "ADMIN" ? "ผู้ดูแลระบบ" : "เจ้าหน้าที่"}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  {u.is_active ? (
                    <Badge className="bg-emerald-100 text-emerald-700">
                      ใช้งานอยู่
                    </Badge>
                  ) : (
                    <Badge variant="outline">ปิดการใช้งาน</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="icon" aria-label="แก้ไข">
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
