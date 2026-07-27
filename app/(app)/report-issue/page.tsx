"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bug, ImagePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { collectErrors, required, runRules } from "@/lib/validation";

const PAGES = [
  "หน้าแรก",
  "บทความความรู้ (รายการ/อ่านบทความ)",
  "เขียน/แก้ไขบทความ",
  "กระทู้ถาม-ตอบ",
  "ตั้ง/แก้ไขกระทู้",
  "ความคิดเห็น/การตอบกลับ",
  "AI Search",
  "แชท",
  "บุ๊คมาร์ค",
  "การแจ้งเตือน",
  "โปรไฟล์",
  "หน้าหลัก (Dashboard)",
  "สมัครสมาชิก/เข้าสู่ระบบ",
  "หน้าแอดมิน",
  "การอัปโหลดรูป/ไฟล์",
  "อื่น ๆ",
];

const MAX_IMAGES = 5;

type Errors = Partial<Record<"page" | "description", string>>;

export default function ReportIssuePage() {
  const toast = useToast();
  const [page, setPage] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImages(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - images.length;
    const list = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.error(`แนบรูปได้สูงสุด ${MAX_IMAGES} รูป`);
    }
    setUploading(true);
    try {
      for (const file of list) {
        if (!file.type.startsWith("image/")) {
          toast.error(`"${file.name}" ไม่ใช่รูปภาพ`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" ใหญ่เกิน 10MB`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post<{ url: string }>("/upload", formData);
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      toast.error("อัปโหลดรูปไม่สำเร็จ", getApiErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const submitMutation = useMutation({
    mutationFn: async () =>
      api.post("/issues", {
        page,
        description: description.trim(),
        link: link.trim() || undefined,
        image_urls: images.length ? images : undefined,
      }),
    onSuccess: () => {
      setSent(true);
      toast.success(
        "ส่งเรื่องเรียบร้อยแล้ว",
        "ทีมนักวิชาการคอมพิวเตอร์ได้รับแจ้งแล้ว ขอบคุณที่ช่วยพัฒนาระบบครับ",
      );
    },
    onError: (err) =>
      toast.error("ส่งเรื่องไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      page: runRules(page, required("กรุณาเลือกหน้าที่พบปัญหา")),
      description: runRules(
        description,
        required("กรุณาอธิบายปัญหาที่พบ เช่น กดปุ่มแล้วเกิดอะไรขึ้น"),
      ),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("ข้อมูลยังไม่ครบ", "กรุณาตรวจสอบช่องที่มีเครื่องหมายสีแดง");
      return;
    }
    submitMutation.mutate();
  }

  function resetForm() {
    setPage("");
    setLink("");
    setDescription("");
    setImages([]);
    setErrors({});
    setSent(false);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center lg:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <Bug className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-4 text-xl font-bold">ส่งเรื่องเรียบร้อยแล้ว 🙏</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ทีมนักวิชาการคอมพิวเตอร์ได้รับแจ้งปัญหาของคุณแล้ว
          และจะรีบตรวจสอบแก้ไขโดยเร็วที่สุด
        </p>
        <Button variant="outline" className="mt-6" onClick={resetForm}>
          แจ้งปัญหาเรื่องอื่นเพิ่ม
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Bug className="h-6 w-6 text-primary" />
        แจ้งปัญหาการใช้งาน
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        เจอบั๊ก หน้าจอผิดเพี้ยน หรือใช้งานส่วนไหนไม่ได้
        แจ้งทีมนักวิชาการคอมพิวเตอร์ได้ที่นี่
      </p>

      <Card className="mt-6 p-6">
        <form className="space-y-5" onSubmit={submit} noValidate>
          <FormField
            label="หน้าที่พบปัญหา"
            required
            htmlFor="page"
            error={errors.page}
          >
            <Combobox
              id="page"
              options={PAGES.map((p) => ({ value: p, label: p }))}
              value={page}
              onChange={(v) => {
                setPage(v);
                if (errors.page)
                  setErrors((prev) => ({ ...prev, page: undefined }));
              }}
              placeholder="เลือกหน้าที่พบปัญหา"
              searchPlaceholder="พิมพ์ชื่อหน้า..."
              emptyText="ไม่พบหน้าที่ค้นหา"
              invalid={!!errors.page}
              disabled={submitMutation.isPending}
            />
          </FormField>

          <FormField
            label="ลิงก์บทความ/กระทู้ที่มีปัญหา (ถ้ามี)"
            htmlFor="link"
            hint="คัดลอก URL จากแถบที่อยู่ของหน้าที่เจอปัญหา มาวางได้เลย"
          >
            <Input
              id="link"
              placeholder="เช่น http://192.168.200.58:3300/discussions/xxxx"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={submitMutation.isPending}
            />
          </FormField>

          <FormField
            label="อธิบายปัญหาที่พบ"
            required
            htmlFor="description"
            error={errors.description}
            hint="เล่าให้ละเอียด: ทำอะไรอยู่ กดปุ่มไหน แล้วเกิดอะไรขึ้น ระบบขึ้นข้อความว่าอะไร"
          >
            <Textarea
              id="description"
              rows={6}
              placeholder={
                "เช่น กดบันทึกฉบับร่างในหน้าเขียนบทความ แล้วขึ้นข้อความ error สีแดง\nลองกดซ้ำอีกรอบก็เหมือนเดิม ใช้เครื่องคอมของแผนก IPD"
              }
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              aria-invalid={!!errors.description}
              className={fieldInvalidClass(errors.description)}
              disabled={submitMutation.isPending}
            />
          </FormField>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              รูปประกอบ (สูงสุด {MAX_IMAGES} รูป)
            </label>
            <p className="mb-2 text-xs text-muted-foreground">
              แคปหน้าจอที่เจอปัญหาแนบมาด้วย จะช่วยให้แก้ได้เร็วขึ้นมาก
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImages(e.target.files)}
            />
            <div className="flex flex-wrap gap-3">
              {images.map((url) => (
                <div
                  key={url}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="รูปประกอบการแจ้งปัญหา"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="ลบรูปนี้"
                    onClick={() =>
                      setImages((prev) => prev.filter((u) => u !== url))
                    }
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || submitMutation.isPending}
                  className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  <ImagePlus className="h-5 w-5" />
                  {uploading ? "กำลังอัป..." : "เพิ่มรูป"}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              variant="dark"
              type="submit"
              loading={submitMutation.isPending}
              disabled={uploading}
            >
              {!submitMutation.isPending && <Send className="h-4 w-4" />}
              ส่งเรื่องถึงทีมคอมพิวเตอร์
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
