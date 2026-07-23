import axios from "axios";

// NestJS API (kmppc-backtend) — cookie-based auth (httpOnly)
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  withCredentials: true,
});
