import {
  BookOpenCheck,
  FileText,
  MessagesSquare,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    title: "1. สมัครสมาชิกและเข้าสู่ระบบ",
    items: [
      "สมัครสมาชิกด้วยรหัสพนักงานและอีเมลโรงพยาบาล",
      "รอผู้ดูแลระบบอนุมัติ จากนั้นเข้าสู่ระบบด้วย Username และรหัสผ่าน",
    ],
  },
  {
    icon: Search,
    title: "2. ค้นหาความรู้",
    items: [
      "ใช้ช่องค้นหาหน้าแรกเพื่อค้นบทความและกระทู้ทั้งหมด",
      "กรองตามหมวดหมู่ เช่น HOSxP, Printer, Network, Lab",
    ],
  },
  {
    icon: Sparkles,
    title: "3. ถาม AI Search",
    items: [
      "พิมพ์คำถามด้วยภาษาไทยธรรมดา เช่น 'printer ไม่พิมพ์ทำยังไง'",
      "AI จะสรุปคำตอบพร้อมแสดงเอกสารอ้างอิง กดดูต้นทางได้ทุกรายการ",
      "กดถูกใจ/ไม่ถูกใจเพื่อช่วยปรับปรุงคุณภาพคำตอบ",
    ],
  },
  {
    icon: FileText,
    title: "4. เขียนบทความ",
    items: [
      "กดปุ่ม 'เขียนบทความ' ในหน้าบทความ",
      "เลือกหมวดหมู่ ใส่แท็ก และบันทึกเป็นฉบับร่างได้ก่อนเผยแพร่",
    ],
  },
  {
    icon: MessagesSquare,
    title: "5. ตั้งกระทู้ถาม-ตอบ",
    items: [
      "ตั้งคำถามพร้อมรายละเอียดอาการและสิ่งที่ลองทำแล้ว",
      "เลือกโพสต์แบบไม่ระบุตัวตนได้ หากไม่สะดวกเปิดเผยชื่อ",
      "เจ้าของกระทู้กดเลือก 'คำตอบที่ดีที่สุด' เมื่อปัญหาได้รับการแก้ไข",
    ],
  },
];

export default function GuidePage() {
  return (
    <PublicShell>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-primary-dark">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            คู่มือการใช้งาน
          </h1>
          <p className="mt-2 text-muted-foreground">
            เริ่มต้นใช้งานระบบจัดการองค์ความรู้ใน 5 ขั้นตอน
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 px-4 py-10 lg:px-6">
        {steps.map((s) => (
          <Card key={s.title} className="flex gap-4 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <s.icon className="h-6 w-6 text-primary" />
            </span>
            <div>
              <h2 className="font-bold">{s.title}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </section>
    </PublicShell>
  );
}
