"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Tags, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useTags, type Tag } from "@/lib/queries";
import { cn } from "@/lib/utils";

export default function AdminTagsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const tags = useTags();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  // แท็กที่ถูกติ๊กเลือกไว้สำหรับลบหลายรายการ
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmTargets, setConfirmTargets] = useState<Tag[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allTags = tags.data ?? [];
  const allSelected = allTags.length > 0 && selected.size === allTags.length;

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["tags"] });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(allTags.map((t) => t.id)));
  }

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      api.patch(`/tags/${id}`, { tag_name: name }),
    onSuccess: () => {
      toast.success("แก้ไขแท็กแล้ว");
      setEditingId(null);
      refetch();
    },
    onError: (err) => toast.error("แก้ไขแท็กไม่สำเร็จ", getApiErrorMessage(err)),
  });

  async function confirmDelete() {
    if (!confirmTargets?.length) return;
    setDeleting(true);
    let success = 0;
    let failed = 0;
    for (const tag of confirmTargets) {
      try {
        await api.delete(`/tags/${tag.id}`);
        success += 1;
      } catch {
        failed += 1;
      }
    }
    setDeleting(false);
    setConfirmTargets(null);
    setSelected(new Set());
    refetch();
    if (failed === 0) {
      toast.success(`ลบแท็กแล้ว ${success} รายการ`);
    } else {
      toast.error(
        `ลบสำเร็จ ${success} รายการ`,
        `ลบไม่สำเร็จ ${failed} รายการ กรุณาลองใหม่`,
      );
    }
  }

  const usedCount = (confirmTargets ?? []).reduce(
    (sum, t) => sum + t.article_count + t.discussion_count,
    0,
  );

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          แท็กถูกสร้างอัตโนมัติเมื่อผู้ใช้เขียนบทความ/ตั้งกระทู้ —
          ติ๊กเลือกหลายแท็กแล้วลบพร้อมกันได้
        </p>
        {allTags.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-input accent-[var(--primary)]"
              />
              เลือกทั้งหมด
            </label>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/5"
              disabled={selected.size === 0}
              onClick={() =>
                setConfirmTargets(allTags.filter((t) => selected.has(t.id)))
              }
            >
              <Trash2 className="h-4 w-4" />
              ลบที่เลือก ({selected.size})
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {tags.isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-14 animate-pulse bg-muted/50" />
          ))}
        {!tags.isLoading && allTags.length === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีแท็กในระบบ
          </Card>
        )}
        {allTags.map((t) => (
          <Card
            key={t.id}
            className={cn(
              "flex items-center gap-3 p-4 transition-colors",
              selected.has(t.id) && "border-primary/50 bg-secondary/40",
            )}
          >
            <input
              type="checkbox"
              checked={selected.has(t.id)}
              onChange={() => toggleSelect(t.id)}
              aria-label={`เลือกแท็ก ${t.tag_name}`}
              className="h-4 w-4 shrink-0 rounded border-input accent-[var(--primary)]"
            />
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Tags className="h-4 w-4 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              {editingId === t.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 max-w-xs"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    aria-label="บันทึกชื่อแท็ก"
                    className="h-9 w-9"
                    onClick={() => {
                      if (!editName.trim()) return;
                      updateMutation.mutate({ id: t.id, name: editName.trim() });
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
                <p className="truncate font-semibold">#{t.tag_name}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{t.article_count} บทความ</Badge>
              <Badge variant="outline">{t.discussion_count} กระทู้</Badge>
              {editingId !== t.id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="แก้ไขชื่อแท็ก"
                    onClick={() => {
                      setEditingId(t.id);
                      setEditName(t.tag_name);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="ลบแท็ก"
                    onClick={() => setConfirmTargets([t])}
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
        open={!!confirmTargets}
        danger
        title={
          confirmTargets && confirmTargets.length > 1
            ? `ลบแท็ก ${confirmTargets.length} รายการ?`
            : `ลบแท็ก "${confirmTargets?.[0]?.tag_name ?? ""}"?`
        }
        description={
          usedCount > 0
            ? `แท็กที่เลือกถูกใช้อยู่ใน ${usedCount} โพสต์ — ลบแล้วแท็กจะหายจากโพสต์เหล่านั้น และย้อนกลับไม่ได้`
            : "การลบย้อนกลับไม่ได้"
        }
        confirmLabel={deleting ? "กำลังลบ..." : "ลบแท็ก"}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTargets(null)}
      >
        {confirmTargets && confirmTargets.length > 1 && (
          <div className="max-h-36 overflow-y-auto rounded-lg bg-muted/50 p-3">
            <div className="flex flex-wrap gap-1.5">
              {confirmTargets.map((t) => (
                <Badge key={t.id} variant="outline">
                  #{t.tag_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
