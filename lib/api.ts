import axios, { type InternalAxiosRequestConfig } from "axios";

// NestJS API (kmppc-backtend) — cookie-based auth (httpOnly)
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  withCredentials: true,
});

// access token หมดอายุ → ลอง refresh หนึ่งครั้งแล้ว retry คำขอเดิม
let refreshing: Promise<unknown> | null = null;

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const config = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const url = String(config?.url ?? "");
    if (config && !config._retry && !url.startsWith("/auth/")) {
      config._retry = true;
      try {
        refreshing ??= api
          .post("/auth/refresh")
          .finally(() => (refreshing = null));
        await refreshing;
        return api(config);
      } catch {
        // refresh ไม่ผ่าน — ส่ง 401 เดิมกลับไปให้ caller จัดการ
      }
    }
  }
  return Promise.reject(error);
});

/** ดึงข้อความ error จาก response ของ NestJS (message เป็น string หรือ string[]) */
export function getApiErrorMessage(
  err: unknown,
  fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่";
    }
    if (err.response.status === 429) {
      return "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
    }
    const message = (err.response.data as { message?: string | string[] })
      ?.message;
    if (Array.isArray(message) && message.length > 0) return message[0];
    if (typeof message === "string" && message) return message;
    if (err.response.status === 401) return "กรุณาเข้าสู่ระบบก่อนใช้งาน";
  }
  return fallback;
}

export function isUnauthorizedError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}
