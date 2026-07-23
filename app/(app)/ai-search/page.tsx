"use client";

import {
  BookOpen,
  FileQuestion,
  FileText,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ตัวอย่างคำตอบ mock — จะเชื่อม SSE จาก NestJS (AiSearchModule) ในสปรินต์ถัดไป
const answerSteps = [
  {
    title: "ตรวจสอบการเชื่อมต่อ",
    items: [
      "ตรวจสอบสาย USB หรือเครือข่ายว่าเชื่อมต่ออยู่",
      "ลองถอดสายแล้วเสียบใหม่ หรือต่อเครื่องพิมพ์อีกครั้ง",
    ],
  },
  {
    title: "ตรวจสอบสถานะเครื่องพิมพ์",
    items: [
      "เปิดหน้าต่าง Devices and Printers",
      "คลิกขวาที่เครื่องพิมพ์ เลือก “ดูสิ่งที่กำลังพิมพ์”",
      "หากมีเอกสารค้าง ให้ยกเลิกทั้งหมด แล้วลองพิมพ์ใหม่",
    ],
  },
  {
    title: "ตรวจสอบไดรเวอร์",
    items: [
      "ตรวจสอบว่าไดรเวอร์เป็นเวอร์ชันล่าสุด",
      "หากมีปัญหา ให้ถอนการติดตั้งแล้วติดตั้งใหม่",
    ],
  },
  {
    title: "ตรวจสอบกระดาษและหมึก",
    items: ["ตรวจสอบว่ามีกระดาษเพียงพอ และหมึก/โทนเนอร์ไม่หมด"],
  },
];

const sources = [
  { title: "การแก้ไขปัญหา Printer เบื้องต้น", type: "SOP", icon: Wrench },
  {
    title: "คู่มือการใช้งานเครื่องพิมพ์ Network Printer",
    type: "คู่มือ",
    icon: BookOpen,
  },
  { title: "FAQ: ปัญหาเครื่องพิมพ์ที่พบบ่อย", type: "FAQ", icon: FileQuestion },
  { title: "ขั้นตอนการติดตั้งไดรเวอร์ Printer", type: "คู่มือ", icon: FileText },
];

const suggestedQuestions = [
  "วิธีติดตั้ง Driver Printer",
  "Printer ขึ้น Error 0x00000709",
  "ล้างคิวการพิมพ์อย่างไร",
  "ตั้งค่า Printer เริ่มต้น",
];

export default function AiSearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="text-2xl font-bold">AI Search (ถาม AI)</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ถามคำถาม แล้ว AI จะหาคำตอบให้จากฐานความรู้ขององค์กร
      </p>

      <Card className="mt-6 flex items-center gap-3 p-3">
        <input
          defaultValue="วิธีแก้ปัญหา Printer ไม่พิมพ์ เชื่อมต่อได้แต่พิมพ์ไม่ออก"
          placeholder="พิมพ์คำถามของคุณ..."
          className="h-11 flex-1 rounded-lg bg-secondary/60 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button variant="dark" size="icon" aria-label="ส่งคำถาม">
          <Send className="h-4 w-4" />
        </Button>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai text-ai-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            คำตอบจาก AI
          </h2>
          <span className="text-xs text-muted-foreground">วันนี้ 10:24</span>
        </div>

        <p className="mt-4 text-sm">
          จากฐานความรู้ที่เกี่ยวข้อง พบวิธีการแก้ไขปัญหา Printer ไม่พิมพ์ ดังนี้
        </p>

        <ol className="mt-4 space-y-4">
          {answerSteps.map((step, i) => (
            <li key={step.title} className="text-sm">
              <p className="font-semibold">
                {i + 1}. {step.title}
              </p>
              <ul className="mt-1.5 space-y-1 pl-5">
                {step.items.map((item) => (
                  <li key={item} className="list-disc text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-sm">
          หากยังไม่สามารถแก้ไขได้ โปรดติดต่อแผนก IT Support
        </p>

        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-sm font-bold">แหล่งอ้างอิง</h3>
          <div className="mt-3 space-y-2">
            {sources.map(({ title, type, icon: Icon }) => (
              <button
                key={title}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  {title}
                </span>
                <Badge variant={type === "SOP" ? "primary" : "default"}>
                  {type}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h3 className="text-sm font-bold">คำถามที่แนะนำ</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <Badge
              key={q}
              className="cursor-pointer px-3 py-1.5 hover:bg-accent"
            >
              {q}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          AI อาจให้ข้อมูลไม่สมบูรณ์ โปรดตรวจสอบจากแหล่งข้อมูลทางการเสมอ
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ThumbsUp className="h-3.5 w-3.5" />
            มีประโยชน์
          </Button>
          <Button variant="outline" size="sm">
            <ThumbsDown className="h-3.5 w-3.5" />
            ให้ข้อเสนอแนะ
          </Button>
        </div>
      </div>
    </div>
  );
}
