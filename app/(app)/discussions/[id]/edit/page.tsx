"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PencilLine, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/rich-editor";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage, isUnauthorizedError } from "@/lib/api";
import {
  useCategories,
  useDiscussion,
  useMe,
  type Discussion,
} from "@/lib/queries";
import { collectErrors, parseTags, required, runRules } from "@/lib/validation";

const TITLE_MAX = 150;

type Errors = Partial<Record<"title" | "category_id" | "content", string>>;

export default function EditDiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const me = useMe();
  const discussion = useDiscussion(id);

  if (discussion.isLoading || me.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <Card className="h-96 animate-pulse bg-muted/50" />
      </div>
    );
  }

  if (discussion.isError || !discussion.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-6">
        <h1 className="text-xl font-bold">ไม่พบกระทู้นี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          กระทู้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
        </p>
      </div>
    );
  }

  const d = discussion.data;
  // กระทู้ anonymous: API ไม่เปิดเผย author id ให้คนอื่น — แก้ได้เฉพาะแอดมิน
  const canEdit =
    !!me.data &&
    (me.data.role.role_name === "ADMIN" ||
      (!d.is_anonymous && d.author.id === me.data.id));
  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center lg:px-6">
        <h1 className="text-xl font-bold">ไม่มีสิทธิ์แก้ไขกระทู้นี้</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          แก้ไขได้เฉพาะเจ้าของกระทู้หรือผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    );
  }

  return <EditDiscussionForm discussion={d} />;
}

// แยก component เพื่อ init state จากข้อมูลกระทู้ได้ตรง ๆ (เลี่ยง setState ใน effect)
function EditDiscussionForm({ discussion }: { discussion: Discussion }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const categories = useCategories();
  const [title, setTitle] = useState(discussion.title);
  const [categoryId, setCategoryId] = useState(discussion.category.id);
  const [tags, setTags] = useState(
    discussion.tags?.map((t) => t.tag.tag_name).join(", ") ?? "",
  );
  const [content, setContent] = useState(discussion.content);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors = collectErrors({
      title: runRules(title, required("กรุณากรอกหัวข้อกระทู้")),
      category_id: runRules(categoryId, required("กรุณาเลือกหมวดหมู่")),
      content: runRules(content, required("กรุณากรอกรายละเอียดกระทู้")),
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!validate()) {
      toast.error("ข้อมูลยังไม่ครบ", "กรุณาตรวจสอบช่องที่มีเครื่องหมายสีแดง");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/discussions/${discussion.id}`, {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        tags: parseTags(tags),
      });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      // ล้าง cache หน้ารายละเอียด — เข้าไปอ่านจะได้เห็นเนื้อหาเวอร์ชันใหม่ทันที
      queryClient.removeQueries({ queryKey: ["discussion", discussion.id] });
      toast.success("บันทึกการแก้ไขแล้ว");
      router.push(`/discussions/${discussion.id}`);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        toast.error("กรุณาเข้าสู่ระบบ", "ต้องเข้าสู่ระบบก่อนจึงจะแก้ไขกระทู้ได้");
        router.push("/login");
        return;
      }
      toast.error("บันทึกการแก้ไขไม่สำเร็จ", getApiErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <PencilLine className="h-6 w-6 text-primary" />
        แก้ไขกระทู้
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{discussion.title}</p>

      <Card className="mt-6 p-6">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <FormField
            label="หัวข้อกระทู้"
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
              disabled={submitting}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="หมวดหมู่"
              required
              htmlFor="category_id"
              error={errors.category_id}
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
                disabled={submitting}
                loading={categories.isLoading}
              />
            </FormField>
            <FormField label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)" htmlFor="tags">
              <Input
                id="tags"
                placeholder="เช่น HOSxP, Backup, Database"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={submitting}
              />
            </FormField>
          </div>

          <FormField
            label="รายละเอียดกระทู้"
            required
            htmlFor="content"
            error={errors.content}
            hint="ลากคลุมข้อความแล้วกดปุ่มจัดรูปแบบ / วางเคอร์เซอร์แล้วกดแทรกรูป-แนบไฟล์ ตรงตำแหน่งที่ต้องการ"
          >
            <RichEditor
              id="content"
              rows={10}
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

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              type="button"
              disabled={submitting}
              onClick={() => router.back()}
            >
              ยกเลิก
            </Button>
            <Button variant="dark" type="submit" loading={submitting}>
              {!submitting && <Send className="h-4 w-4" />}
              {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
