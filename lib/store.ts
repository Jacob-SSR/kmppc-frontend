"use client";

// Zustand — client state ที่แชร์ข้ามหน้า (ตามกติกา CLAUDE.md: ใช้กับ
// สถานะฝั่ง client เท่านั้น เช่น socket/online — server data ใช้ React Query)

import { create } from "zustand";

interface RealtimeState {
  /** id ผู้ใช้ที่ออนไลน์อยู่ (จาก event users:online ของ socket) */
  onlineIds: Set<string>;
  setOnlineIds: (ids: string[]) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  onlineIds: new Set<string>(),
  setOnlineIds: (ids) => set({ onlineIds: new Set(ids) }),
}));
