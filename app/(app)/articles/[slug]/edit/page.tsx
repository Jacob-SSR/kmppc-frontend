"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, PencilLine, Save, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/rich-editor";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { useArticle, useCategories, useMe, type Article } from "@/lib/queries";
import { collectErrors, parseTags, required, runRules } from "@/lib/validation";

const TITLE_MAX = 150;

type Errors = Partial<Record<"title" | "category_id" | "content", string>>;

export default function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const me = useMe();
  const article = useArticle(slug);

  if (article.isLoading || me.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <Card className="h-96 animate-pulse bg-muted/50" />
      </div>
    );
  }

  if (article.isError || !article.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-6">
        <h1 className="text-xl font-bold">ไม่พบบทความนี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          บทความอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
        </p>
      </div>
    );
  }

  const canEdit =
    !!me.data &&
    (me.data.role.role_name === "ADMIN" ||
      article.data.author.id === me.data.id);
  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-6">
        <h1 className="text-xl font-bold">ไม่มีสิทธิ์แก้ไขบทความนี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          แก้ไขได้เฉพาะเจ้าของบทความหรือผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    );
  }

  return <EditArticleForm article={article.data} />;
}

// แยก component เพื่อ init state จากข้อมูลบทความได้ตรง ๆ (เลี่ยง setState ใน effect)
function EditArticleForm({ article }: { article: Article }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const categories = useCategories();
  const [title, setTitle] = useState(article.title);
  const [categoryId, setCategoryId] = useState(article.category.id);
  const [tags, setTags] = useState(
    article.tags?.map((t) => t.tag.tag_name).join(", ") ?? "",
  );
  const [excerpt, setExcerpt] = useState(article.excerpt ?? "");
  const [content, setContent] = useState(article.content);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState<"DRAFT" | "PUBLISHED" | null>(
    null,
  );

  const isDraft = article.status === "DRAFT";

  const [cover, setCover] = useState<string | null>(article.cover_image);
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
      await api.patch(`/articles/${article.id}`, {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        cover_image: cover,
        excerpt: excerpt.trim(),
        tags: parseTags(tags),
        status,
      });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // ล้าง cache หน้ารายละเอียด — เข้าไปอ่านจะได้เห็นเนื้อหาเวอร์ชันใหม่ทันที
      queryClient.removeQueries({ queryKey: ["article", article.slug] });
      if (status === "PUBLISHED") {
        toast.success("บันทึกการแก้ไขแล้ว");
        router.push(`/articles/${article.slug}`);
      } else {
        toast.success("บันทึกฉบับร่างแล้ว", "กด \"เผยแพร่\" เมื่อพร้อม");
        router.push("/dashboard");
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        toast.error("กรุณาเข้าสู่ระบบ", "ต้องเข้าสู่ระบบก่อนจึงจะแก้ไขบทความได้");
        router.push("/login");
        return;
      }
      toast.error("บันทึกการแก้ไขไม่สำเร็จ", getApiErrorMessage(err));
      setSubmitting(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <PencilLine className="h-6 w-6 text-primary" />
        แก้ไขบทความ
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isDraft ? "ฉบับร่าง — ยังไม่เผยแพร่ให้คนอื่นเห็น" : article.title}
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
              disabled={!!submitting}
              onClick={() => router.back()}
            >
              ยกเลิก
            </Button>
            {isDraft && (
              <Button
                variant="outline"
                type="button"
                loading={submitting === "DRAFT"}
                disabled={!!submitting}
                onClick={() => submit("DRAFT")}
              >
                {submitting !== "DRAFT" && (
                  <Save className="h-4 w-4 text-primary" />
                )}
                {submitting === "DRAFT" ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
              </Button>
            )}
            <Button
              variant="dark"
              type="submit"
              loading={submitting === "PUBLISHED"}
              disabled={!!submitting}
            >
              {submitting !== "PUBLISHED" && <Send className="h-4 w-4" />}
              {submitting === "PUBLISHED"
                ? "กำลังบันทึก..."
                : isDraft
                  ? "เผยแพร่บทความ"
                  : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
