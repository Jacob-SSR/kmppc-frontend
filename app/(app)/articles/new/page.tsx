"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FilePlus2, ImagePlus, Save, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/rich-editor";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useCategories } from "@/lib/queries";
import { collectErrors, parseTags, required, runRules } from "@/lib/validation";

const TITLE_MAX = 150;

type Errors = Partial<Record<"title" | "category_id" | "content", string>>;

export default function NewArticlePage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
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

  // รูปหน้าปก — อัปโหลดผ่าน POST /upload แล้วส่ง url ไปกับ cover_image
  const [cover, setCover] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function handleCover(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("ไฟล์หน้าปกต้องเป็นรูปภาพ");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("รูปใหญ่เกิน 10MB");
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<{ url: string }>("/upload", formData);
      setCover(data.url);
      toast.success("อัปโหลดรูปหน้าปกแล้ว");
    } catch (err) {
      toast.error("อัปโหลดรูปไม่สำเร็จ", getApiErrorMessage(err));
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

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
        cover_image: cover ?? undefined,
        excerpt: excerpt.trim() || undefined,
        tags: parseTags(tags),
        status,
      });
      // ล้าง cache รายการเพื่อให้บทความใหม่โผล่ทันทีโดยไม่ต้อง refresh
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (status === "PUBLISHED") {
        toast.success("เผยแพร่บทความสำเร็จ", "ขอบคุณที่ร่วมแบ่งปันความรู้");
        router.push("/articles");
      } else {
        toast.success(
          "บันทึกฉบับร่างแล้ว",
          "ดูฉบับร่างได้ที่หน้าหลักของคุณ กด \"เผยแพร่\" เมื่อพร้อม",
        );
        router.push("/dashboard");
      }
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
              <Combobox
                id="category_id"
                options={(categories.data ?? []).map((c) => ({
                  value: c.id,
                  label: c.category_name,
                }))}
                value={categoryId}
                onChange={(id) => {
                  setCategoryId(id);
                  if (errors.category_id)
                    setErrors((prev) => ({ ...prev, category_id: undefined }));
                }}
                placeholder="เลือกหมวดหมู่"
                searchPlaceholder="พิมพ์ชื่อหมวดหมู่..."
                emptyText="ไม่พบหมวดหมู่ที่ค้นหา"
                invalid={!!errors.category_id}
                disabled={!!submitting}
                loading={categories.isLoading}
              />
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
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCover(e.target.files)}
            />
            {cover ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt="รูปหน้าปกบทความ"
                  className="h-48 w-full object-cover"
                />
                <div className="absolute right-2 top-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => coverInputRef.current?.click()}
                    loading={uploadingCover}
                  >
                    เปลี่ยนรูป
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => setCover(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
              >
                <ImagePlus className="h-7 w-7" />
                {uploadingCover
                  ? "กำลังอัปโหลด..."
                  : "คลิกเพื่ออัปโหลดรูปภาพ (ไม่เกิน 10MB)"}
              </button>
            )}
          </div>

          <FormField
            label="เนื้อหาบทความ"
            required
            htmlFor="content"
            error={errors.content}
            hint="ลากคลุมข้อความแล้วกดปุ่มจัดรูปแบบ / วางเคอร์เซอร์แล้วกดแทรกรูป-แนบไฟล์ ตรงตำแหน่งที่ต้องการ"
          >
            <RichEditor
              id="content"
              rows={12}
              placeholder={
                "เขียนเนื้อหาบทความของคุณที่นี่...\n\nพิมพ์ข้อความ วางลิงก์ แล้วกดปุ่ม \"แทรกรูป\" ตรงตำแหน่งที่ต้องการ รูปจะแสดงแทรกในเนื้อหาแบบกระทู้ pantip"
              }
              value={content}
              onChange={(next) => {
                setContent(next);
                if (errors.content)
                  setErrors((prev) => ({ ...prev, content: undefined }));
              }}
              invalid={!!errors.content}
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
