import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // build แบบ standalone สำหรับรันใน Docker — ได้ server.js + ไฟล์เท่าที่จำเป็น
  output: "standalone",
};

export default nextConfig;
