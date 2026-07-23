import {
  BookOpen,
  HeartHandshake,
  Lightbulb,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "คลังบทความและ SOP",
    desc: "รวบรวมคู่มือ บทความ และขั้นตอนการปฏิบัติงานมาตรฐานจากทุกแผนก ค้นหาง่าย อ้างอิงได้",
  },
  {
    icon: MessagesSquare,
    title: "กระทู้ถาม-ตอบ",
    desc: "ถามปัญหาหน้างานได้ทันที มีระบบคำตอบที่ดีที่สุด และตั้งกระทู้แบบไม่ระบุตัวตนได้",
  },
  {
    icon: Sparkles,
    title: "AI Search",
    desc: "ถามด้วยภาษาธรรมชาติ AI จะสรุปคำตอบจากฐานความรู้ของโรงพยาบาลพร้อมแหล่งอ้างอิง",
  },
  {
    icon: ShieldCheck,
    title: "ปลอดภัยและตรวจสอบได้",
    desc: "ข้อมูลอยู่ภายในโรงพยาบาล มีระบบสิทธิผู้ใช้งาน และบันทึกกิจกรรมการใช้งาน",
  },
];

export default function AboutPage() {
  return (
    <PublicShell>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center lg:px-6">
          <h1 className="text-3xl font-bold text-primary-dark lg:text-4xl">
            เกี่ยวกับระบบจัดการองค์ความรู้
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            ระบบจัดการองค์ความรู้ (Knowledge Management System)
            ของโรงพยาบาลศรีสุข สร้างขึ้นเพื่อให้ความรู้และประสบการณ์ของบุคลากรทุกคน
            ถูกเก็บรักษา ส่งต่อ และนำไปใช้พัฒนางานได้จริง
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                <f.icon className="h-6 w-6 text-primary" />
              </span>
              <h2 className="mt-4 font-bold">{f.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 lg:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-primary-dark">
            <Target className="h-5 w-5 text-primary" /> เป้าหมายของเรา
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li className="flex gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ลดการสูญหายขององค์ความรู้เมื่อบุคลากรโยกย้ายหรือเกษียณ
            </li>
            <li className="flex gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ลดเวลาการแก้ปัญหาหน้างานด้วยคำตอบที่ค้นหาได้ทันที
            </li>
            <li className="flex gap-2">
              <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              สร้างวัฒนธรรมการแบ่งปันความรู้ระหว่างแผนก
            </li>
          </ul>
        </Card>
      </section>
    </PublicShell>
  );
}
