"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { systemSettings } from "@/lib/mock-data";

// ตั้งค่าระบบ — จะเชื่อม GET /api/settings + PATCH /api/settings/:key (ADMIN) ในสปรินต์ถัดไป
export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-4">
      {systemSettings.map((s) => (
        <Card key={s.key} className="p-5">
          <label className="block font-semibold">{s.label}</label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {s.description} ({s.key})
          </p>
          <div className="mt-3">
            {s.value === "true" || s.value === "false" ? (
              <Select defaultValue={s.value} className="max-w-[200px]">
                <option value="true">เปิดใช้งาน</option>
                <option value="false">ปิดใช้งาน</option>
              </Select>
            ) : (
              <Input defaultValue={s.value} />
            )}
          </div>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button variant="dark">
          <Save className="h-4 w-4" />
          บันทึกการตั้งค่า
        </Button>
      </div>
    </div>
  );
}
