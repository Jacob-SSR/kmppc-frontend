"use client";

import { CheckCircle2, Eye, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminReports } from "@/lib/mock-data";

// รายงานเนื้อหา — จะเชื่อม GET/PATCH /api/reports (ADMIN) ในสปรินต์ถัดไป
const statusBadge = {
  PENDING: <Badge className="bg-amber-100 text-amber-700">รอตรวจสอบ</Badge>,
  REVIEWED: <Badge variant="ai">ตรวจสอบแล้ว</Badge>,
  RESOLVED: (
    <Badge className="bg-emerald-100 text-emerald-700">ดำเนินการแล้ว</Badge>
  ),
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-3">
      {adminReports.map((r) => (
        <Card key={r.id} className="flex items-start gap-4 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <Flag className="h-5 w-5 text-destructive" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{r.target}</p>
              <Badge variant="outline">{r.type}</Badge>
              {statusBadge[r.status]}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              เหตุผล: {r.reason}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              รายงานโดย {r.reporter} · {r.time}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 text-primary" />
              ดูเนื้อหา
            </Button>
            {r.status === "PENDING" && (
              <Button size="sm">
                <CheckCircle2 className="h-4 w-4" />
                ตรวจสอบแล้ว
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
