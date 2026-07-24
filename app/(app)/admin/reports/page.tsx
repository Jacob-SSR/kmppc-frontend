"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Eye, Flag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAdminReports, type AdminReport } from "@/lib/queries";
import { fullName, timeAgo } from "@/lib/format";

const statusBadge: Record<AdminReport["status"], React.ReactNode> = {
  PENDING: <Badge className="bg-amber-100 text-amber-700">รอตรวจสอบ</Badge>,
  REVIEWED: <Badge variant="ai">ตรวจสอบแล้ว</Badge>,
  RESOLVED: (
    <Badge className="bg-emerald-100 text-emerald-700">ดำเนินการแล้ว</Badge>
  ),
};

const typeLabel: Record<string, string> = {
  article: "บทความ",
  discussion: "กระทู้",
  reply: "คำตอบ",
  comment: "ความคิดเห็น",
};

function reportTargetText(r: AdminReport): string {
  if (!r.target) return "เนื้อหาถูกลบไปแล้ว";
  return "title" in r.target ? r.target.title : r.target.excerpt;
}

export default function AdminReportsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const reports = useAdminReports({ limit: 50 });
  // รายงานที่กำลังจะลบเนื้อหาเป้าหมาย — ยืนยันผ่าน modal ก่อน
  const [removeTarget, setRemoveTarget] = useState<AdminReport | null>(null);

  const removeTargetMutation = useMutation({
    mutationFn: async (reportId: string) =>
      api.post(`/reports/${reportId}/remove-target`),
    onSuccess: () => {
      toast.success("ลบเนื้อหาแล้ว", "รายงานถูกปิดเป็น \"ดำเนินการแล้ว\"");
      setRemoveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error("ลบเนื้อหาไม่สำเร็จ", getApiErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "REVIEWED" | "RESOLVED";
    }) => api.patch(`/reports/${id}`, { status }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === "REVIEWED"
          ? "ทำเครื่องหมายตรวจสอบแล้ว"
          : "ปิดรายงานเรียบร้อย",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err) => toast.error("ทำรายการไม่สำเร็จ", getApiErrorMessage(err)),
  });

  if (reports.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  const items = reports.data?.items ?? [];

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          ยังไม่มีรายงานเนื้อหา
        </Card>
      )}
      {items.map((r) => {
        const targetText = r.target
          ? "title" in r.target
            ? r.target.title
            : r.target.excerpt
          : "เนื้อหาถูกลบไปแล้ว";
        return (
          <Card key={r.id} className="flex items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <Flag className="h-5 w-5 text-destructive" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{targetText}</p>
                {r.target && (
                  <Badge variant="outline">
                    {typeLabel[r.target.type] ?? r.target.type}
                  </Badge>
                )}
                {statusBadge[r.status]}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                เหตุผล: {r.reason}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                รายงานโดย {fullName(r.reporter)} · {timeAgo(r.created_at)}
                {r.reviewer && ` · ตรวจสอบโดย ${fullName(r.reviewer)}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {r.target?.type === "discussion" && (
                <Link href={`/discussions/${r.target.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 text-primary" />
                    ดูเนื้อหา
                  </Button>
                </Link>
              )}
              {r.status === "PENDING" && (
                <Button
                  size="sm"
                  onClick={() =>
                    statusMutation.mutate({ id: r.id, status: "REVIEWED" })
                  }
                  disabled={statusMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  ตรวจสอบแล้ว
                </Button>
              )}
              {r.status === "REVIEWED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    statusMutation.mutate({ id: r.id, status: "RESOLVED" })
                  }
                  disabled={statusMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  ปิดรายงาน
                </Button>
              )}
              {r.status !== "RESOLVED" && r.target && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/5"
                  onClick={() => setRemoveTarget(r)}
                  disabled={removeTargetMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  ลบ{typeLabel[r.target.type] ?? "เนื้อหา"}
                </Button>
              )}
            </div>
          </Card>
        );
      })}

      <ConfirmDialog
        open={!!removeTarget}
        danger
        title={`ลบ${
          removeTarget?.target
            ? (typeLabel[removeTarget.target.type] ?? "เนื้อหา")
            : "เนื้อหา"
        }ที่ถูกรายงาน?`}
        description={`"${removeTarget ? reportTargetText(removeTarget) : ""}" จะถูกลบ และรายงานนี้จะถูกปิดเป็น "ดำเนินการแล้ว" — การลบย้อนกลับไม่ได้`}
        confirmLabel={`ลบ${
          removeTarget?.target
            ? (typeLabel[removeTarget.target.type] ?? "เนื้อหา")
            : "เนื้อหา"
        }`}
        loading={removeTargetMutation.isPending}
        onConfirm={() =>
          removeTarget && removeTargetMutation.mutate(removeTarget.id)
        }
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
