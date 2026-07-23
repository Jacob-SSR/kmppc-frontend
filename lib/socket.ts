"use client";

import { io, type Socket } from "socket.io-client";

// namespace `chat` ของ backend — auth ผ่าน httpOnly cookie (access_token)
function chatSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  const origin = apiUrl.replace(/\/api\/?$/, "");
  return `${origin}/chat`;
}

let socket: Socket | null = null;

/** socket ตัวเดียวต่อแอป — เชื่อมต่อครั้งแรกเมื่อถูกเรียกใช้ */
export function getChatSocket(): Socket {
  socket ??= io(chatSocketUrl(), {
    withCredentials: true,
    autoConnect: false,
  });
  return socket;
}
