"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, LayoutGrid, Pencil, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useCategories, type Category } from "@/lib/queries";
import { required, runRules } from "@/lib/validation";

export default function AdminCategoriesPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const categories = useCategories();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newNameError, setNewNameError] = useState<string>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post("/categories", {
        category_name: newName.trim(),
        description: newDescription.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("เพิ่มหมวดหมู่แล้ว", `"${newName.trim()}" พร้อมใช้งานทันที`);
      setNewName("");
      setNewDescription("");
      refetch();
    },
    onError: (err) =>
      toast.error("เพิ่มหมวดหมู่ไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      api.patch(`/categories/${id}`, { category_name: name }),
    onSuccess: () => {
      toast.success("แก้ไขหมวดหมู่แล้ว");
      setEditingId(null);
      refetch();
    },
    onError: (err) =>
      toast.error("แก้ไขหมวดหมู่ไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success("ลบหมวดหมู่แล้ว");
      setConfirmTarget(null);
      refetch();
    },
    onError: (err) =>
      toast.error("ลบหมวดหมู่ไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const error = runRules(newName, required("กรุณากรอกชื่อหมวดหมู่"));
    setNewNameError(error ?? undefined);
    if (error) return;
    createMutation.mutate();
  }

  function remove(c: Category) {
    if (c.article_count > 0 || c.discussion_count > 0) {
      toast.error(
        "ลบหมวดหมู่ไม่ได้",
        "ยังมีบทความหรือกระทู้อยู่ในหมวดหมู่นี้ ต้องย้ายออกก่อน",
      );
      return;
    }
    setConfirmTarget(c);
  }

  return (
    <div className="max-w-3xl">
      {/* เพิ่มหมวดหมู่ */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <LayoutGrid className="h-5 w-5 text-primary" />
          เพิ่มหมวดหมู่ความรู้
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={submitCreate}
          noValidate
        >
          <FormField
            label="ชื่อหมวดหมู่"
            required
            htmlFor="category-name"
            error={newNameError}
          >
            <Input
              id="category-name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (newNameError) setNewNameError(undefined);
              }}
              placeholder="เช่น HOSxP, Network, SOP"
              aria-invalid={!!newNameError}
              className={fieldInvalidClass(newNameError)}
              disabled={createMutation.isPending}
            />
          </FormField>
          <FormField label="คำอธิบาย" htmlFor="category-description">
            <Input
              id="category-description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="อธิบายสั้น ๆ (ไม่บังคับ)"
              disabled={createMutation.isPending}
            />
          </FormField>
          <div className="flex items-end">
            <Button variant="dark" type="submit" loading={createMutation.isPending}>
              {!createMutation.isPending && <Plus className="h-4 w-4" />}
              เพิ่ม
            </Button>
          </div>
        </form>
      </Card>

      {/* รายการหมวดหมู่ */}
      <div className="mt-4 space-y-2">
        {categories.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-16 animate-pulse bg-muted/50" />
          ))}
        {!categories.isLoading && (categories.data?.length ?? 0) === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีหมวดหมู่ — เพิ่มหมวดหมู่แรกได้เลย
          </Card>
        )}
        {categories.data?.map((c) => (
          <Card key={c.id} className="flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              {editingId === c.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 max-w-xs"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    aria-label="บันทึกชื่อ"
                    className="h-9 w-9"
                    onClick={() => {
                      if (!editName.trim()) return;
                      updateMutation.mutate({ id: c.id, name: editName.trim() });
                    }}
                    loading={updateMutation.isPending}
                  >
                    {!updateMutation.isPending && <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="ยกเลิก"
                    className="h-9 w-9"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="font-semibold">{c.category_name}</p>
                  {c.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{c.article_count} บทความ</Badge>
              <Badge variant="outline">{c.discussion_count} กระทู้</Badge>
              {editingId !== c.id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="แก้ไขชื่อ"
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.category_name);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="ลบหมวดหมู่"
                    onClick={() => remove(c)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        danger
        title={`ลบหมวดหมู่ "${confirmTarget?.category_name ?? ""}"?`}
        description="การลบย้อนกลับไม่ได้ — ลบได้เฉพาะหมวดหมู่ที่ไม่มีบทความหรือกระทู้อยู่"
        confirmLabel="ลบหมวดหมู่"
        loading={deleteMutation.isPending}
        onConfirm={() => confirmTarget && deleteMutation.mutate(confirmTarget.id)}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
