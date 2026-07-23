"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Tags, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useTags, type Tag } from "@/lib/queries";

export default function AdminTagsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const tags = useTags();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ["tags"] });
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => {
      toast.success("ลบแท็กแล้ว");
      refetch();
    },
    onError: (err) => toast.error("ลบแท็กไม่สำเร็จ", getApiErrorMessage(err)),
  });

  function remove(t: Tag) {
    const used = t.article_count + t.discussion_count;
    const message =
      used > 0
        ? `แท็ก "${t.tag_name}" ถูกใช้ใน ${used} โพสต์ — ลบแล้วแท็กจะหายจากโพสต์เหล่านั้น ยืนยันลบ?`
        : `ยืนยันลบแท็ก "${t.tag_name}"?`;
    if (window.confirm(message)) deleteMutation.mutate(t.id);
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm text-muted-foreground">
        แท็กถูกสร้างอัตโนมัติเมื่อผู้ใช้เขียนบทความ/ตั้งกระทู้ —
        ใช้หน้านี้แก้ชื่อหรือลบแท็กที่ผิด/ซ้ำ
      </p>

      <div className="mt-4 space-y-2">
        {tags.isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-14 animate-pulse bg-muted/50" />
          ))}
        {!tags.isLoading && (tags.data?.length ?? 0) === 0 && (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            ยังไม่มีแท็กในระบบ
          </Card>
        )}
        {tags.data?.map((t) => (
          <Card key={t.id} className="flex items-center gap-4 p-4">
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
                    onClick={() => remove(t)}
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
    </div>
  );
}
