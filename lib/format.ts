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
  author: { fname: string; lname: string | null } | null | undefined,
): string {
  if (!author) return "ไม่ระบุตัวตน";
  return `${author.fname} ${author.lname ?? ""}`.trim() || "ไม่ระบุตัวตน";
}

export function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function formatNum(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("th-TH");
}
