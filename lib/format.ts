import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

/** "3 ชั่วโมงที่แล้ว" จาก ISO string */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: th });
}

export function fullName(
  author:
    | { fname: string; lname: string | null; display_name?: string | null }
    | null
    | undefined,
): string {
  if (!author) return "ไม่ระบุตัวตน";
  // ชื่อที่แสดง (สไตล์เฟซบุ๊ก) มาก่อนชื่อจริง — ชื่อจริงดูได้ในหน้าโปรไฟล์
  if (author.display_name?.trim()) return author.display_name.trim();
  return `${author.fname} ${author.lname ?? ""}`.trim() || "ไม่ระบุตัวตน";
}

/** ชื่อจริงเสมอ (ใช้ในหน้าโปรไฟล์) */
export function realName(
  author: { fname: string; lname: string | null } | null | undefined,
): string {
  if (!author) return "-";
  return `${author.fname} ${author.lname ?? ""}`.trim() || "-";
}

export function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function formatNum(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("th-TH");
}
