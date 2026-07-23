"use client";

import { FilePlus2, ImagePlus, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { allCategories } from "@/lib/mock-data";

// เขียนบทความ — จะเชื่อม POST /api/articles (title, content, category_id, excerpt, tags, status) ในสปรินต์ถัดไป
export default function NewArticlePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <FilePlus2 className="h-6 w-6 text-primary" />
        เขียนบทความใหม่
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        แบ่งปันความรู้ คู่มือ หรือ SOP ให้เพื่อนร่วมงาน
      </p>

      <Card className="mt-6 p-6">
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              หัวข้อบทความ <span className="text-destructive">*</span>
            </label>
            <Input placeholder="เช่น วิธีการ Backup ข้อมูล HOSxP" />
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
              <Input placeholder="เช่น HOSxP, Backup, Database" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              คำโปรย (สรุปสั้น ๆ)
            </label>
            <Input placeholder="สรุปเนื้อหาบทความใน 1-2 ประโยค" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              รูปภาพหน้าปก
            </label>
            <button
              type="button"
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ImagePlus className="h-7 w-7" />
              คลิกเพื่ออัปโหลดรูปภาพ (ไม่เกิน 10MB)
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              เนื้อหาบทความ <span className="text-destructive">*</span>
            </label>
            <Textarea
              rows={12}
              placeholder="เขียนเนื้อหาบทความของคุณที่นี่..."
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" type="button">
              <Save className="h-4 w-4 text-primary" />
              บันทึกฉบับร่าง
            </Button>
            <Button variant="dark" type="submit">
              <Send className="h-4 w-4" />
              เผยแพร่บทความ
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
