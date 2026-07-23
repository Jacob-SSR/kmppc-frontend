"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useSettings, type SystemSetting } from "@/lib/queries";

// คำอธิบาย key ที่รู้จัก — key อื่นแสดงชื่อ key ตรง ๆ
const settingMeta: Record<string, { label: string; description: string }> = {
  ai_search_enabled: {
    label: "เปิดใช้งาน AI Search",
    description: "อนุญาตให้ผู้ใช้งานถามคำถามกับ AI",
  },
  allow_registration: {
    label: "เปิดรับสมัครสมาชิก",
    description: "อนุญาตให้พนักงานสมัครบัญชีใหม่ได้เอง",
  },
  allow_anonymous_post: {
    label: "อนุญาตโพสต์ไม่ระบุตัวตน",
    description: "ให้ผู้ใช้งานตั้งกระทู้/ตอบแบบไม่แสดงชื่อได้",
  },
  site_announcement: {
    label: "ประกาศของระบบ",
    description: "ข้อความประกาศที่แสดงให้ผู้ใช้งานทุกคนเห็น",
  },
};

function SettingsForm({ settings }: { settings: SystemSetting[] }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(settings.map((s) => [s.key, s.value])),
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const changed = settings.filter(
        (s) => values[s.key] !== undefined && values[s.key] !== s.value,
      );
      for (const s of changed) {
        await api.patch(`/settings/${s.key}`, { value: values[s.key] });
      }
      return changed.length;
    },
    onSuccess: (count) => {
      toast.success(
        count > 0 ? `บันทึกการตั้งค่าแล้ว (${count} รายการ)` : "ไม่มีรายการที่เปลี่ยนแปลง",
      );
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err) => toast.error("บันทึกไม่สำเร็จ", getApiErrorMessage(err)),
  });

  return (
    <div className="max-w-2xl space-y-4">
      {settings.map((s) => {
        const meta = settingMeta[s.key];
        const value = values[s.key] ?? s.value;
        const isBoolean = s.value === "true" || s.value === "false";
        return (
          <Card key={s.key} className="p-5">
            <label className="block font-semibold" htmlFor={s.key}>
              {meta?.label ?? s.key}
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {meta?.description ? `${meta.description} ` : ""}({s.key})
            </p>
            <div className="mt-3">
              {isBoolean ? (
                <Select
                  id={s.key}
                  value={value}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.key]: e.target.value }))
                  }
                  className="max-w-[200px]"
                >
                  <option value="true">เปิดใช้งาน</option>
                  <option value="false">ปิดใช้งาน</option>
                </Select>
              ) : (
                <Input
                  id={s.key}
                  value={value}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.key]: e.target.value }))
                  }
                />
              )}
            </div>
          </Card>
        );
      })}
      <div className="flex justify-end">
        <Button
          variant="dark"
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
        >
          {!saveMutation.isPending && <Save className="h-4 w-4" />}
          {saveMutation.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const settings = useSettings();

  if (settings.isLoading) {
    return <Card className="h-48 max-w-2xl animate-pulse bg-muted/50" />;
  }

  if ((settings.data?.length ?? 0) === 0) {
    return (
      <Card className="max-w-2xl p-10 text-center text-sm text-muted-foreground">
        ยังไม่มีการตั้งค่าในระบบ (seed SystemSetting ก่อน)
      </Card>
    );
  }

  return <SettingsForm settings={settings.data!} />;
}
