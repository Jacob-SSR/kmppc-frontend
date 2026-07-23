"use client";

import {
  BookMarked,
  FilePlus2,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { knowledgeDocs } from "@/lib/mock-data";

// คลังเอกสารสำหรับ AI (RAG) — จะเชื่อม /api/knowledge-documents (ADMIN) ในสปรินต์ถัดไป
const statusBadge = {
  DONE: <Badge className="bg-emerald-100 text-emerald-700">Index แล้ว</Badge>,
  INDEXING: <Badge variant="ai">กำลัง Index...</Badge>,
  PENDING: <Badge variant="outline">รอ Index</Badge>,
  FAILED: (
    <Badge className="bg-red-100 text-red-700">Index ไม่สำเร็จ</Badge>
  ),
};

const typeLabel = { MANUAL: "คู่มือ", SOP: "SOP", FAQ: "FAQ" };

export default function AdminKnowledgePage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          เอกสารในคลังนี้จะถูกนำไปใช้เป็นฐานความรู้ให้ AI Search ตอบคำถาม
        </p>
        <Button variant="dark" size="sm">
          <FilePlus2 className="h-4 w-4" />
          เพิ่มเอกสาร
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {knowledgeDocs.map((d) => (
          <Card key={d.id} className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <BookMarked className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{d.title}</p>
                <Badge variant="outline">{typeLabel[d.doc_type]}</Badge>
                {statusBadge[d.index_status]}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.department} · อัปเดตล่าสุด {d.updated}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {d.index_status === "FAILED" && (
                <Button variant="ghost" size="icon" aria-label="Index ใหม่">
                  <RefreshCw className="h-4 w-4 text-ai" />
                </Button>
              )}
              <Button variant="ghost" size="icon" aria-label="แก้ไข">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="ลบ">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
