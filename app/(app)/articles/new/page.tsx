"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FilePlus2, ImagePlus, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useCategories } from "@/lib/queries";
import { collectErrors, parseTags, required, runRules } from "@/lib/validation";

const TITLE_MAX = 150;

type Errors = Partial<Record<"title" | "category_id" | "content", string>>;

export default function NewArticlePage() {
  const router = useRouter();
  const toast = useToast();
  const categories = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  // "DRAFT" | "PUBLISHED" ระหว่างส่ง, null เมื่อไม่ได้ส่ง
  const [submitting, setSubmitting] = useState<"DRAFT" | "PUBLISHED" | null>(
    null,
  );

  function validate(): boolean {
    const nextErrors = collectErrors({
      title: runRules(title, required("กรุณากรอกหัวข้อบทความ")),
      category_id: runRules(categoryId, required("กรุณาเลือกหมวดหมู่")),
      content: runRules(content, required("กรุณากรอกเนื้อหาบทความ")),
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(status: "DRAFT" | "PUBLISHED") {
    if (!validate()) {
      toast.error("ข้อมูลยังไม่ครบ", "กรุณาตรวจสอบช่องที่มีเครื่องหมายสีแดง");
      return;
    }
    setSubmitting(status);
    try {
      await api.post("/articles", {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        excerpt: excerpt.trim() || undefined,
        tags: parseTags(tags),
        status,
      });
      if (status === "PUBLISHED") {
        toast.success("เผยแพร่บทความสำเร็จ", "ขอบคุณที่ร่วมแบ่งปันความรู้");
      } else {
        toast.success("บันทึกฉบับร่างแล้ว", "กลับมาแก้ไขต่อได้ทุกเมื่อ");
      }
      router.push("/articles");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        toast.error("กรุณาเข้าสู่ระบบ", "ต้องเข้าสู่ระบบก่อนจึงจะเขียนบทความได้");
        router.push("/login");
        return;
      }
      toast.error("บันทึกบทความไม่สำเร็จ", getApiErrorMessage(err));
      setSubmitting(null);
    }
  }

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
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit("PUBLISHED");
          }}
          noValidate
        >
          <FormField
            label="หัวข้อบทความ"
            required
            htmlFor="title"
            error={errors.title}
            hint={`${title.length}/${TITLE_MAX} ตัวอักษร`}
          >
            <Input
              id="title"
              placeholder="เช่น วิธีการ Backup ข้อมูล HOSxP"
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              aria-invalid={!!errors.title}
              className={fieldInvalidClass(errors.title)}
              disabled={!!submitting}
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
                disabled={!!submitting || categories.isLoading}
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
                placeholder="เช่น HOSxP, Backup, Database"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={!!submitting}
              />
            </FormField>
          </div>

          <FormField label="คำโปรย (สรุปสั้น ๆ)" htmlFor="excerpt">
            <Input
              id="excerpt"
              placeholder="สรุปเนื้อหาบทความใน 1-2 ประโยค"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={!!submitting}
            />
          </FormField>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              รูปภาพหน้าปก
            </label>
            <button
              type="button"
              onClick={() =>
                toast.info(
                  "ยังอัปโหลดรูปไม่ได้",
                  "ระบบอัปโหลดรูปภาพหน้าปกอยู่ระหว่างการพัฒนา",
                )
              }
              className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ImagePlus className="h-7 w-7" />
              คลิกเพื่ออัปโหลดรูปภาพ (ไม่เกิน 10MB)
            </button>
          </div>

          <FormField
            label="เนื้อหาบทความ"
            required
            htmlFor="content"
            error={errors.content}
          >
            <Textarea
              id="content"
              rows={12}
              placeholder="เขียนเนื้อหาบทความของคุณที่นี่..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content)
                  setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              aria-invalid={!!errors.content}
              className={fieldInvalidClass(errors.content)}
              disabled={!!submitting}
            />
          </FormField>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              type="button"
              loading={submitting === "DRAFT"}
              disabled={!!submitting}
              onClick={() => submit("DRAFT")}
            >
              {submitting !== "DRAFT" && <Save className="h-4 w-4 text-primary" />}
              {submitting === "DRAFT" ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
            </Button>
            <Button
              variant="dark"
              type="submit"
              loading={submitting === "PUBLISHED"}
              disabled={!!submitting}
            >
              {submitting !== "PUBLISHED" && <Send className="h-4 w-4" />}
              {submitting === "PUBLISHED" ? "กำลังเผยแพร่..." : "เผยแพร่บทความ"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
