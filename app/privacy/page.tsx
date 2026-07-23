import { ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "1. ข้อมูลที่เราจัดเก็บ",
    body: "ระบบจัดเก็บข้อมูลบัญชีผู้ใช้งาน (ชื่อ-นามสกุล รหัสพนักงาน อีเมล แผนก ตำแหน่ง) เนื้อหาที่ท่านสร้าง (บทความ กระทู้ คำตอบ ความคิดเห็น) และบันทึกการใช้งานระบบ (Activity Log) เพื่อความปลอดภัยและการตรวจสอบ",
  },
  {
    title: "2. วัตถุประสงค์การใช้ข้อมูล",
    body: "ข้อมูลถูกใช้เพื่อการยืนยันตัวตน การแสดงผลเนื้อหา การแจ้งเตือน และการปรับปรุงคุณภาพของระบบ รวมถึงการประมวลผลคำถามด้วย AI ภายในขอบเขตฐานความรู้ของโรงพยาบาลเท่านั้น",
  },
  {
    title: "3. การโพสต์แบบไม่ระบุตัวตน",
    body: "กระทู้และคำตอบที่เลือก 'ไม่ระบุตัวตน' จะไม่แสดงชื่อผู้โพสต์ต่อผู้ใช้งานทั่วไป อย่างไรก็ตามระบบยังบันทึกเจ้าของเนื้อหาไว้ภายใน เพื่อการดูแลตามนโยบายการใช้งานเมื่อจำเป็นเท่านั้น",
  },
  {
    title: "4. การเปิดเผยข้อมูล",
    body: "ข้อมูลทั้งหมดจัดเก็บภายในระบบของโรงพยาบาล ไม่มีการขายหรือส่งต่อข้อมูลส่วนบุคคลให้บุคคลภายนอก เว้นแต่เป็นไปตามกฎหมายหรือคำสั่งของหน่วยงานที่มีอำนาจ",
  },
  {
    title: "5. สิทธิของท่าน",
    body: "ท่านสามารถขอแก้ไขข้อมูลส่วนตัวได้ที่หน้าโปรไฟล์ และติดต่อแผนกเทคโนโลยีสารสนเทศเพื่อขอตรวจสอบหรือลบข้อมูลตามสิทธิที่กฎหมายกำหนด",
  },
];

export default function PrivacyPage() {
  return (
    <PublicShell>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-primary-dark">
            <ShieldCheck className="h-8 w-8 text-primary" />
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="mt-2 text-muted-foreground">
            ปรับปรุงล่าสุด: กรกฎาคม 2569
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 px-4 py-10 lg:px-6">
        {sections.map((s) => (
          <Card key={s.title} className="p-6">
            <h2 className="font-bold text-primary-dark">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </Card>
        ))}
      </section>
    </PublicShell>
  );
}
