// กติกา validate ฝั่ง client — ข้อความต้องตรงกับ DTO ฝั่ง backend (kmppc-backtend)
// backend ยังคง validate ซ้ำเสมอ ฝั่งนี้มีไว้เพื่อ UX เท่านั้น

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Rule = (value: string) => string | null;

export const required =
  (message: string): Rule =>
  (value) =>
    value.trim() ? null : message;

export const email =
  (message = "รูปแบบอีเมลไม่ถูกต้อง"): Rule =>
  (value) =>
    !value.trim() || EMAIL_RE.test(value.trim()) ? null : message;

export const minLength =
  (length: number, message: string): Rule =>
  (value) =>
    !value || value.length >= length ? null : message;

export const matches =
  (other: string, message: string): Rule =>
  (value) =>
    value === other ? null : message;

/** คืน error แรกที่เจอ หรือ null ถ้าผ่านทุกข้อ */
export function runRules(value: string, ...rules: Rule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

/** ตัด key ที่ค่าเป็น null ออก — เหลือเฉพาะ field ที่มี error จริง */
export function collectErrors<K extends string>(
  candidates: Record<K, string | null>,
): Partial<Record<K, string>> {
  const errors: Partial<Record<K, string>> = {};
  for (const key of Object.keys(candidates) as K[]) {
    const message = candidates[key];
    if (message) errors[key] = message;
  }
  return errors;
}

/** แปลงช่องแท็กเป็นรายการ — แยกได้ทั้งจุลภาคและช่องว่าง ตัด # นำหน้า และตัดตัวซ้ำ */
export function parseTags(raw: string): string[] {
  const tags = raw
    .split(/[,\s]+/)
    .map((t) => t.trim().replace(/^#+/, ""))
    .filter(Boolean);
  return [...new Set(tags)];
}
