"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, UserPlus, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAdminUsers, useMe, type Me } from "@/lib/queries";
import { useDebounced } from "@/lib/use-debounce";

export default function AdminUsersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const me = useMe();
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q);
  const users = useAdminUsers({ limit: 50, q: debouncedQ.trim() || undefined });
  // บัญชีที่กำลังจะปิดการใช้งาน — ต้องยืนยันผ่าน modal ก่อน
  const [confirmUser, setConfirmUser] = useState<Me | null>(null);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/users/${id}`, { is_active }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.is_active ? "เปิดใช้งานบัญชีแล้ว" : "ปิดการใช้งานบัญชีแล้ว",
      );
      setConfirmUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อ, username, รหัสพนักงาน..."
            className="pl-9"
          />
        </div>
        <Button
          variant="dark"
          size="sm"
          onClick={() =>
            toast.info(
              "เพิ่มผู้ใช้งาน",
              "ให้พนักงานสมัครสมาชิกด้วยตนเองที่หน้าสมัครสมาชิก แล้วจัดการสิทธิ์จากหน้านี้",
            )
          }
        >
          <UserPlus className="h-4 w-4" />
          เพิ่มผู้ใช้งาน
        </Button>
      </div>

      <Card className="mt-4 overflow-x-auto">
        {users.isLoading ? (
          <div className="h-48 animate-pulse bg-muted/50" />
        ) : (
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
              {users.data?.items.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fname} size="sm" />
                      <div>
                        <p className="font-medium">
                          {u.fname} {u.lname}
                        </p>
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
                    {u.department.dept_name}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        u.role.role_name === "ADMIN" ? "primary" : "default"
                      }
                    >
                      {u.role.role_name === "ADMIN"
                        ? "ผู้ดูแลระบบ"
                        : "เจ้าหน้าที่"}
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
                    {u.id !== me.data?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          u.is_active ? "ปิดการใช้งานบัญชี" : "เปิดใช้งานบัญชี"
                        }
                        onClick={() =>
                          u.is_active
                            ? setConfirmUser(u)
                            : toggleMutation.mutate({
                                id: u.id,
                                is_active: true,
                              })
                        }
                        disabled={toggleMutation.isPending}
                      >
                        {u.is_active ? (
                          <UserX className="h-4 w-4 text-destructive" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {users.data?.items.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    ไม่พบผู้ใช้งานที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmUser}
        danger
        title={`ปิดการใช้งานบัญชี "${confirmUser?.fname ?? ""} ${confirmUser?.lname ?? ""}"?`}
        description="ผู้ใช้จะเข้าสู่ระบบไม่ได้จนกว่าจะเปิดใช้งานอีกครั้ง — ข้อมูลและโพสต์ของผู้ใช้ยังอยู่ครบ"
        confirmLabel="ปิดการใช้งาน"
        loading={toggleMutation.isPending}
        onConfirm={() =>
          confirmUser &&
          toggleMutation.mutate({ id: confirmUser.id, is_active: false })
        }
        onCancel={() => setConfirmUser(null)}
      />
    </div>
  );
}
