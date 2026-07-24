"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  ImagePlus,
  Italic,
  Paperclip,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/rich-text";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import { fieldInvalidClass } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

/**
 * ช่องเขียนเนื้อหาแบบ pantip/word: แถบจัดรูปแบบ (ขนาด/หนา/เอียง/ขีดเส้นใต้)
 * แทรกรูปและไฟล์แนบตรงตำแหน่งเคอร์เซอร์ พร้อมตัวอย่างการแสดงผลสด
 * ใช้ร่วมกันทั้งหน้าเขียนบทความและตั้งกระทู้
 */
export function RichEditor({
  id,
  value,
  onChange,
  rows = 10,
  placeholder,
  disabled,
  invalid,
  maxImages = 10,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  maxImages?: number;
}) {
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const imageCount = (value.match(/!\[/g) ?? []).length;

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current;
    const pos = el?.selectionStart ?? value.length;
    const before = value.slice(0, pos);
    const after = value.slice(pos);
    const block =
      (before && !before.endsWith("\n") ? "\n" : "") + snippet + "\n";
    onChange(before + block + after);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const p = pos + block.length;
      el.setSelectionRange(p, p);
    });
  }

  function wrapSelection(prefix: string, suffix: string, placeholderText: string) {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart ?? 0;
    const e = el.selectionEnd ?? s;
    const selected = value.slice(s, e) || placeholderText;
    onChange(value.slice(0, s) + prefix + selected + suffix + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + prefix.length, s + prefix.length + selected.length);
    });
  }

  function setLineHeading(level: number) {
    const el = textareaRef.current;
    const pos = el?.selectionStart ?? value.length;
    const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
    let lineEnd = value.indexOf("\n", pos);
    if (lineEnd === -1) lineEnd = value.length;
    const line = value.slice(lineStart, lineEnd).replace(/^#{1,3}\s+/, "");
    const nextLine = level > 0 ? `${"#".repeat(level)} ${line}` : line;
    onChange(value.slice(0, lineStart) + nextLine + value.slice(lineEnd));
    requestAnimationFrame(() => {
      el?.focus();
      const p = lineStart + nextLine.length;
      el?.setSelectionRange(p, p);
    });
  }

  async function uploadOne(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<{ url: string; filename?: string }>(
      "/upload",
      formData,
    );
    return { url: data.url, filename: data.filename ?? file.name };
  }

  function handleUploadError(err: unknown) {
    if (isUnauthorizedError(err)) {
      toast.error("กรุณาเข้าสู่ระบบ", "ต้องเข้าสู่ระบบก่อนจึงจะแนบไฟล์ได้");
    } else {
      toast.error("อัปโหลดไม่สำเร็จ", getApiErrorMessage(err));
    }
  }

  async function handleInsertImages(files: FileList | null) {
    if (!files?.length) return;
    setUploadingImages(true);
    try {
      let count = imageCount;
      const snippets: string[] = [];
      for (const file of Array.from(files)) {
        if (count >= maxImages) {
          toast.error(`ใส่รูปได้สูงสุด ${maxImages} รูป`);
          break;
        }
        if (!file.type.startsWith("image/")) {
          toast.error("ไม่ใช่ไฟล์รูปภาพ", file.name);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error("รูปใหญ่เกิน 10MB", file.name);
          continue;
        }
        const { url, filename } = await uploadOne(file);
        snippets.push(`![${filename}](${url})`);
        count += 1;
      }
      // แทรกครั้งเดียว — แทรกทีละอันตำแหน่งเคอร์เซอร์จะค้างค่าเก่า
      if (snippets.length > 0) insertAtCursor(snippets.join("\n"));
    } catch (err) {
      handleUploadError(err);
    } finally {
      setUploadingImages(false);
      if (imagesInputRef.current) imagesInputRef.current.value = "";
    }
  }

  async function handleInsertFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadingFile(true);
    try {
      const snippets: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error("ไฟล์ใหญ่เกิน 10MB", file.name);
          continue;
        }
        const { url, filename } = await uploadOne(file);
        snippets.push(`[📎 ${filename}](${url})`);
      }
      if (snippets.length > 0) insertAtCursor(snippets.join("\n"));
    } catch (err) {
      handleUploadError(err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1.5">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value !== "") setLineHeading(Number(e.target.value));
          }}
          disabled={disabled}
          className="h-8 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="ขนาดตัวอักษร"
        >
          <option value="" disabled>
            ขนาดตัวอักษร
          </option>
          <option value="1">หัวข้อใหญ่</option>
          <option value="2">หัวข้อรอง</option>
          <option value="3">หัวข้อย่อย</option>
          <option value="0">ปกติ</option>
        </select>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="ตัวหนา"
          title="ตัวหนา"
          disabled={disabled}
          onClick={() => wrapSelection("**", "**", "ข้อความตัวหนา")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="ตัวเอียง"
          title="ตัวเอียง"
          disabled={disabled}
          onClick={() => wrapSelection("*", "*", "ข้อความตัวเอียง")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="ขีดเส้นใต้"
          title="ขีดเส้นใต้"
          disabled={disabled}
          onClick={() => wrapSelection("__", "__", "ข้อความขีดเส้นใต้")}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <input
          ref={imagesInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleInsertImages(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleInsertFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => imagesInputRef.current?.click()}
          loading={uploadingImages}
          disabled={disabled || imageCount >= maxImages}
        >
          {!uploadingImages && <ImagePlus className="h-4 w-4 text-primary" />}
          {uploadingImages
            ? "กำลังอัปโหลด..."
            : `แทรกรูป (${imageCount}/${maxImages})`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => fileInputRef.current?.click()}
          loading={uploadingFile}
          disabled={disabled}
        >
          {!uploadingFile && <Paperclip className="h-4 w-4 text-primary" />}
          {uploadingFile ? "กำลังอัปโหลด..." : "แนบไฟล์"}
        </Button>
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={cn(invalid && fieldInvalidClass("invalid"))}
        disabled={disabled}
      />

      {value.trim() && (
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            ตัวอย่างการแสดงผล
          </p>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            <RichText text={value} />
          </div>
        </div>
      )}
    </div>
  );
}
