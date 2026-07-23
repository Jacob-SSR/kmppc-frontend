"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldInvalidClass } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { collectErrors, minLength, required, runRules } from "@/lib/validation";

const channels = [
  {
    icon: Phone,
    title: "โทรศัพท์ภายใน",
    lines: ["แผนก IT: ต่อ 1234", "แจ้งปัญหาเร่งด่วน: ต่อ 1235"],
  },
  {
    icon: Mail,
    title: "อีเมล",
    lines: ["it-support@srisuk-hospital.go.th"],
  },
  {
    icon: MapPin,
    title: "ที่ตั้งแผนก",
    lines: ["อาคารอำนวยการ ชั้น 2", "ห้องเทคโนโลยีสารสนเทศ"],
  },
  {
    icon: Clock,
    title: "เวลาทำการ",
    lines: ["จันทร์ - ศุกร์ 08:30 - 16:30 น.", "นอกเวลา: โทรเวรฉุกเฉิน IT"],
  },
];

type Errors = Partial<Record<"name" | "contact" | "message", string>>;

export default function ContactPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // ยังไม่มี endpoint รับข้อความติดต่อฝั่ง backend — validate และตอบรับฝั่ง client ไปก่อน
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = collectErrors({
      name: runRules(name, required("กรุณากรอกชื่อ-นามสกุล")),
      contact: runRules(contact, required("กรุณากรอกช่องทางติดต่อกลับ")),
      message: runRules(
        message,
        required("กรุณากรอกข้อความ"),
        minLength(10, "กรุณาอธิบายรายละเอียดอย่างน้อย 10 ตัวอักษร"),
      ),
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setName("");
      setContact("");
      setMessage("");
      toast.success(
        "ส่งข้อความเรียบร้อย",
        "ขอบคุณสำหรับข้อความ เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด",
      );
    }, 600);
  }

  return (
    <PublicShell>
      <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-accent/60">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-6">
          <h1 className="text-3xl font-bold text-primary-dark">ติดต่อเรา</h1>
          <p className="mt-2 text-muted-foreground">
            พบปัญหาการใช้งานระบบ หรือมีข้อเสนอแนะ ติดต่อแผนกเทคโนโลยีสารสนเทศได้ทุกช่องทาง
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-2 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map((c) => (
            <Card key={c.title} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <c.icon className="h-5 w-5 text-primary" />
              </span>
              <h2 className="mt-3 font-bold">{c.title}</h2>
              {c.lines.map((l) => (
                <p key={l} className="mt-1 text-sm text-muted-foreground">
                  {l}
                </p>
              ))}
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="font-bold">ส่งข้อความถึงเรา</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
            <FormField label="ชื่อ-นามสกุล" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                placeholder="กรอกชื่อ-นามสกุล"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                aria-invalid={!!errors.name}
                className={fieldInvalidClass(errors.name)}
                disabled={submitting}
              />
            </FormField>
            <FormField
              label="อีเมลหรือเบอร์ภายใน"
              htmlFor="contact"
              error={errors.contact}
            >
              <Input
                id="contact"
                placeholder="สำหรับติดต่อกลับ"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  if (errors.contact)
                    setErrors((prev) => ({ ...prev, contact: undefined }));
                }}
                aria-invalid={!!errors.contact}
                className={fieldInvalidClass(errors.contact)}
                disabled={submitting}
              />
            </FormField>
            <FormField label="ข้อความ" htmlFor="message" error={errors.message}>
              <Textarea
                id="message"
                rows={5}
                placeholder="รายละเอียดปัญหาหรือข้อเสนอแนะ..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message)
                    setErrors((prev) => ({ ...prev, message: undefined }));
                }}
                aria-invalid={!!errors.message}
                className={fieldInvalidClass(errors.message)}
                disabled={submitting}
              />
            </FormField>
            <Button
              variant="dark"
              className="w-full"
              type="submit"
              loading={submitting}
            >
              {!submitting && <Send className="h-4 w-4" />}
              {submitting ? "กำลังส่ง..." : "ส่งข้อความ"}
            </Button>
          </form>
        </Card>
      </section>
    </PublicShell>
  );
}
