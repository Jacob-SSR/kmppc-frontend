"use client";

/**
 * คัดลอกข้อความลง clipboard — ใช้ navigator.clipboard เมื่ออยู่บน HTTPS
 * ถ้าไม่ได้ (เว็บภายในรันบน http://) fallback เป็น execCommand แบบเก่า
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // ตกลงไปใช้ fallback ด้านล่าง
    }
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
