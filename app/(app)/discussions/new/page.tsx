"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, Send, VenetianMask } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/rich-editor";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useCategories } from "@/lib/queries";
import { collectErrors, parseTags, required, runRules } from "@/lib/validation";

const TITLE_MAX = 150;

type Errors = Partial<Record<"title" | "category_id" | "content", string>>;

export default function NewDiscussionPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const categories = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      title: runRules(title, required("กรุณากรอกหัวข้อกระทู้")),
      category_id: runRules(categoryId, required("กรุณาเลือกหมวดหมู่")),
      content: runRules(content, required("กรุณากรอกรายละเอียด")),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("ข้อมูลยังไม่ครบ", "กรุณาตรวจสอบช่องที่มีเครื่องหมายสีแดง");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/discussions", {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        is_anonymous: anonymous,
        tags: parseTags(tags),
      });
      toast.success(
        "โพสต์กระทู้สำเร็จ",
        anonymous
          ? "โพสต์แบบไม่ระบุตัวตนแล้ว ชื่อของคุณจะไม่แสดงต่อผู้อื่น"
          : "รอเพื่อนร่วมงานเข้ามาช่วยตอบได้เลย",
      );
      // ล้าง cache รายการเพื่อให้กระทู้ใหม่โผล่ทันทีโดยไม่ต้อง refresh
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/discussions");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        toast.error("กรุณาเข้าสู่ระบบ", "ต้องเข้าสู่ระบบก่อนจึงจะตั้งกระทู้ได้");
        router.push("/login");
        return;
      }
      toast.error("โพสต์กระทู้ไม่สำเร็จ", getApiErrorMessage(err));
      setSubmitting(false);
    }
  }

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
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <FormField
            label="หัวข้อกระทู้"
            required
            htmlFor="title"
            error={errors.title}
            hint={`${title.length}/${TITLE_MAX} ตัวอักษร`}
          >
            <Input
              id="title"
              placeholder="เช่น Printer OPD ชั้น 1 พิมพ์ไม่ได้"
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              aria-invalid={!!errors.title}
              className={fieldInvalidClass(errors.title)}
              disabled={submitting}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="หมวดหมู่"
              required
              htmlFor="category_id"
              error={errors.category_id}
              hint={
                categories.isError
                  ? "โหลดหมวดหมู่ไม่สำเร็จ กรุณารีเฟรชหน้า"
                  : undefined
              }
            >
              <Select
                id="category_id"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.category_id)
                    setErrors((prev) => ({ ...prev, category_id: undefined }));
                }}
                aria-invalid={!!errors.category_id}
                className={fieldInvalidClass(errors.category_id)}
                disabled={submitting || categories.isLoading}
              >
                <option value="" disabled>
                  {categories.isLoading
                    ? "กำลังโหลดหมวดหมู่..."
                    : "เลือกหมวดหมู่"}
                </option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)" htmlFor="tags">
              <Input
                id="tags"
                placeholder="เช่น Printer, OPD"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={submitting}
              />
            </FormField>
          </div>

          <FormField
            label="รายละเอียด"
            required
            htmlFor="content"
            error={errors.content}
            hint="ลากคลุมข้อความแล้วกดปุ่มจัดรูปแบบ / แทรกรูปหน้าจอ error หรือแนบไฟล์ประกอบได้เลย"
          >
            <RichEditor
              id="content"
              rows={8}
              placeholder="อธิบายอาการของปัญหา จุดที่เกิด และสิ่งที่ลองแก้ไขไปแล้ว... แทรกรูปหน้าจอประกอบได้"
              value={content}
              onChange={(next) => {
                setContent(next);
                if (errors.content)
                  setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              invalid={!!errors.content}
              disabled={submitting}
            />
          </FormField>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-[var(--primary)]"
              disabled={submitting}
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
            <Button variant="dark" type="submit" loading={submitting}>
              {!submitting && <Send className="h-4 w-4" />}
              {submitting ? "กำลังโพสต์..." : "โพสต์กระทู้"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
