// ข้อมูลตัวอย่างสำหรับหน้าแรก — จะถูกแทนที่ด้วยข้อมูลจริงจาก API (React Query) ในสปรินต์ถัดไป

export const popularKeywords = [
  "HOSxP",
  "การใช้งาน Printer",
  "Network",
  "Lab",
  "X-Ray",
  "Backup",
  "VLAN",
];

export const categories = [
  { key: "it", name: "IT", count: 156, icon: "monitor" },
  { key: "hosxp", name: "HOSxP", count: 124, icon: "printer" },
  { key: "printer", name: "Printer", count: 67, icon: "printer" },
  { key: "network", name: "Network", count: 98, icon: "network" },
  { key: "lab", name: "Lab", count: 89, icon: "flask" },
  { key: "xray", name: "X-Ray", count: 43, icon: "scan" },
  { key: "sop", name: "SOP", count: 212, icon: "book" },
  { key: "all", name: "ทั้งหมด", count: 789, icon: "grid" },
];

export const latestArticles = [
  {
    slug: "hosxp-backup-guide",
    title: "วิธีการ Backup ข้อมูล HOSxP",
    excerpt: "คู่มือการสำรองข้อมูลระบบ HOSxP อย่างถูกต้องและปลอดภัย",
    category: "HOSxP",
    author: "คุณสมชาย จ.",
    views: 245,
    time: "2 ชม. ที่แล้ว",
  },
  {
    slug: "printer-network-setup",
    title: "การตั้งค่า Printer ผ่าน Network",
    excerpt: "ขั้นตอนการตั้งค่า Printer ให้ใช้งานร่วมกันในระบบ Network",
    category: "Printer",
    author: "คุณวิไลพร ส.",
    views: 189,
    time: "5 ชม. ที่แล้ว",
  },
  {
    slug: "ransomware-prevention",
    title: "แนวทางการป้องกันไวรัส Ransomware",
    excerpt: "แนวทางป้องกันและรับมือกับไวรัส Ransomware ในโรงพยาบาล",
    category: "IT",
    author: "คุณเอกชัย พ.",
    views: 312,
    time: "1 วัน ที่แล้ว",
  },
  {
    slug: "hosxp-permission-check",
    title: "การตรวจสอบสิทธิการใช้งาน HOSxP",
    excerpt: "วิธีตรวจสอบและแก้ไขปัญหาสิทธิการใช้งานในระบบ HOSxP",
    category: "HOSxP",
    author: "คุณธิติศักดิ์ น.",
    views: 156,
    time: "1 วัน ที่แล้ว",
  },
];

export const recentDiscussions = [
  {
    id: "1",
    title: "Printer OPD ชั้น 1 พิมพ์ไม่ได้",
    category: "Printer",
    author: "ประยุงใจ",
    time: "3 ชม. ที่แล้ว",
    replies: 5,
    views: 123,
  },
  {
    id: "2",
    title: "HOSxP ขึ้น Error เวลาออกใบเสร็จ",
    category: "HOSxP",
    author: "ไม่ประสงค์ออกนาม",
    time: "6 ชม. ที่แล้ว",
    replies: 8,
    views: 156,
  },
  {
    id: "3",
    title: "สอบถามการตั้งค่า VLAN บน Switch",
    category: "Network",
    author: "คุณอนันต์",
    time: "1 วัน ที่แล้ว",
    replies: 12,
    views: 234,
  },
  {
    id: "4",
    title: "Lab: เครื่อง CBC แจ้ง Error E-01",
    category: "Lab",
    author: "ประยุงใจ",
    time: "1 วัน ที่แล้ว",
    replies: 7,
    views: 98,
  },
  {
    id: "5",
    title: "ขอแนวทางการสำรองข้อมูลรายวัน",
    category: "IT",
    author: "คุณสุนธร",
    time: "2 วัน ที่แล้ว",
    replies: 3,
    views: 76,
  },
];

export const siteStats = [
  { value: "789", label: "บทความทั้งหมด", icon: "book" },
  { value: "1,234", label: "กระทู้ทั้งหมด", icon: "chat" },
  { value: "568", label: "สมาชิกทั้งหมด", icon: "users" },
  { value: "45,678", label: "การเข้าชมทั้งหมด", icon: "eye" },
  { value: "3,456", label: "ยอดไลค์ทั้งหมด", icon: "like" },
];
