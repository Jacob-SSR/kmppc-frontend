"use client";

import { MessageSquarePlus, Send, VenetianMask } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { allCategories } from "@/lib/mock-data";

// ตั้งกระทู้ — จะเชื่อม POST /api/discussions (title, content, category_id, is_anonymous, tags) ในสปรินต์ถัดไป
export default function NewDiscussionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <MessageSquarePlus className="h-6 w-6 text-primary" />
        ตั้งกระทู้ใหม่
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        อธิบายปัญหาให้ละเอียด พร้อมสิ่งที่ลองทำแล้ว จะช่วยให้ได้คำตอบเร็วขึ้น
      </p>

      <Card className="mt-6 p-6">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              หัวข้อกระทู้ <span className="text-destructive">*</span>
            </label>
            <Input placeholder="เช่น Printer OPD ชั้น 1 พิมพ์ไม่ได้" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                หมวดหมู่ <span className="text-destructive">*</span>
              </label>
              <Select defaultValue="">
                <option value="" disabled>
                  เลือกหมวดหมู่
                </option>
                {allCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                แท็ก (คั่นด้วยเครื่องหมายจุลภาค)
              </label>
              <Input placeholder="เช่น Printer, OPD" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              รายละเอียด <span className="text-destructive">*</span>
            </label>
            <Textarea
              rows={8}
              placeholder={
                "อธิบายอาการของปัญหา จุดที่เกิด และสิ่งที่ลองแก้ไขไปแล้ว..."
              }
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-input accent-[var(--primary)]"
            />
            <span>
              <span className="flex items-center gap-1.5 font-medium">
                <VenetianMask className="h-4 w-4 text-primary" />
                โพสต์แบบไม่ระบุตัวตน
              </span>
              <span className="mt-0.5 block text-muted-foreground">
                ชื่อของคุณจะไม่แสดงต่อผู้ใช้งานคนอื่น
              </span>
            </span>
          </label>

          <div className="flex justify-end border-t border-border pt-4">
            <Button variant="dark" type="submit">
              <Send className="h-4 w-4" />
              โพสต์กระทู้
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
