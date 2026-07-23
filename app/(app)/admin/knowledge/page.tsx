"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookMarked, FilePlus2, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useKnowledgeDocs, type KnowledgeDoc } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { collectErrors, required, runRules } from "@/lib/validation";

const statusBadge: Record<KnowledgeDoc["index_status"], React.ReactNode> = {
  DONE: <Badge className="bg-emerald-100 text-emerald-700">Index แล้ว</Badge>,
  INDEXING: <Badge variant="ai">กำลัง Index...</Badge>,
  PENDING: <Badge variant="outline">รอ Index</Badge>,
  FAILED: <Badge className="bg-red-100 text-red-700">Index ไม่สำเร็จ</Badge>,
};

const typeLabel: Record<KnowledgeDoc["doc_type"], string> = {
  MANUAL: "คู่มือ",
  SOP: "SOP",
  FAQ: "FAQ",
};

type Errors = Partial<Record<"title" | "content", string>>;

export default function AdminKnowledgePage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const docs = useKnowledgeDocs();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    doc_type: "MANUAL" as KnowledgeDoc["doc_type"],
    description: "",
    content: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["knowledge-docs"] });
  }

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post("/knowledge-documents", {
        title: form.title.trim(),
        doc_type: form.doc_type,
        description: form.description.trim() || undefined,
        content: form.content.trim(),
      }),
    onSuccess: () => {
      toast.success("เพิ่มเอกสารแล้ว", "ระบบจะ index เข้าฐานความรู้ AI อัตโนมัติ");
      setForm({ title: "", doc_type: "MANUAL", description: "", content: "" });
      setShowForm(false);
      refetch();
    },
    onError: (err) => toast.error("เพิ่มเอกสารไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/knowledge-documents/${id}`),
    onSuccess: () => {
      toast.success("ลบเอกสารแล้ว");
      refetch();
    },
    onError: (err) => toast.error("ลบเอกสารไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      title: runRules(form.title, required("กรุณากรอกชื่อเอกสาร")),
      content: runRules(form.content, required("กรุณากรอกเนื้อหาเอกสาร")),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    createMutation.mutate();
  }

  function remove(d: KnowledgeDoc) {
    if (window.confirm(`ยืนยันลบเอกสาร "${d.title}"?`)) {
      deleteMutation.mutate(d.id);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          เอกสารในคลังนี้จะถูกนำไปใช้เป็นฐานความรู้ให้ AI Search ตอบคำถาม
        </p>
        <Button variant="dark" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <FilePlus2 className="h-4 w-4" />}
          {showForm ? "ยกเลิก" : "เพิ่มเอกสาร"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-4 p-5">
          <h2 className="font-bold">เพิ่มเอกสารใหม่</h2>
          <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <FormField
                label="ชื่อเอกสาร"
                required
                htmlFor="doc-title"
                error={errors.title}
              >
                <Input
                  id="doc-title"
                  value={form.title}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, title: e.target.value }));
                    if (errors.title)
                      setErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder="เช่น คู่มือการใช้งาน HOSxP"
                  aria-invalid={!!errors.title}
                  className={fieldInvalidClass(errors.title)}
                  disabled={createMutation.isPending}
                />
              </FormField>
              <FormField label="ประเภท" htmlFor="doc-type">
                <Select
                  id="doc-type"
                  value={form.doc_type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      doc_type: e.target.value as KnowledgeDoc["doc_type"],
                    }))
                  }
                  disabled={createMutation.isPending}
                >
                  <option value="MANUAL">คู่มือ</option>
                  <option value="SOP">SOP</option>
                  <option value="FAQ">FAQ</option>
                </Select>
              </FormField>
            </div>
            <FormField label="คำอธิบาย" htmlFor="doc-description">
              <Input
                id="doc-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="สรุปสั้น ๆ ว่าเอกสารนี้เกี่ยวกับอะไร"
                disabled={createMutation.isPending}
              />
            </FormField>
            <FormField
              label="เนื้อหาเอกสาร"
              required
              htmlFor="doc-content"
              error={errors.content}
            >
              <Textarea
                id="doc-content"
                rows={8}
                value={form.content}
                onChange={(e) => {
                  setForm((f) => ({ ...f, content: e.target.value }));
                  if (errors.content)
                    setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                placeholder="วางเนื้อหาเอกสารที่ต้องการให้ AI ใช้ตอบคำถาม..."
                aria-invalid={!!errors.content}
                className={fieldInvalidClass(errors.content)}
                disabled={createMutation.isPending}
              />
            </FormField>
            <div className="flex justify-end">
              <Button variant="dark" type="submit" loading={createMutation.isPending}>
                {createMutation.isPending ? "กำลังบันทึก..." : "บันทึกเอกสาร"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-4 space-y-3">
        {docs.isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted/50" />
          ))}
        {!docs.isLoading && (docs.data?.length ?? 0) === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีเอกสารในคลังความรู้ — กด &quot;เพิ่มเอกสาร&quot; เพื่อเริ่มต้น
          </Card>
        )}
        {docs.data?.map((d) => (
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
                {d.department?.dept_name ?? "ส่วนกลาง"} · อัปเดตล่าสุด{" "}
                {timeAgo(d.updated_at)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="ลบเอกสาร"
              onClick={() => remove(d)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
