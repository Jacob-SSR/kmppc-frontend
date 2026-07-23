# KM System (Frontend) — กติกาโปรเจกต์

- Repo นี้คือ Next.js (App Router, TypeScript, Tailwind v4) — **frontend เท่านั้น** ห้ามแตะ database ตรง
- Backend อยู่ repo `kmppc-backtend` (NestJS, port 3001, prefix `/api`) — เรียกผ่าน `lib/api.ts` (axios + httpOnly cookie)
- Server data ใช้ React Query เท่านั้น / Zustand ใช้แค่ client state (auth, unread, socket)
- UI ภาษาไทยทั้งหมด — ธีมเขียวมิ้นท์ pastel กำหนดใน `app/globals.css` (CSS vars สไตล์ shadcn + Tailwind v4 `@theme inline`)
- ฟอนต์ IBM Plex Sans Thai ผ่าน `next/font` (ตัวแปร `--font-ibm-plex-thai`)
- UI components อยู่ `components/ui/` (สไตล์ shadcn) — ใช้ `cn()` จาก `lib/utils.ts`
- สีพิเศษ: `primary-dark` (ปุ่มหลัก/navbar/footer เขียวเข้ม), `ai` (ม่วงน้ำเงินสำหรับฟีเจอร์ AI)
- ข้อมูลทุกหน้าดึงจาก API จริงผ่าน hooks ใน `lib/queries.ts` (React Query) — ไม่มี mock data แล้ว
- ก่อน commit: รัน `pnpm lint` + `pnpm build`
