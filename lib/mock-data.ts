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

// ---------- ข้อมูล mock เพิ่มเติมสำหรับทุกหน้า (shape ล้อกับ API จริงของ kmppc-backtend) ----------

export const currentUser = {
  id: "u-1",
  fname: "ณัฐวุฒิ",
  lname: "ใจดี",
  username: "nattawut.j",
  email: "nattawut.j@phlapphlachai-hospital.go.th",
  employee_no: "EMP-1042",
  position: "IT Support",
  phone: "081-234-5678",
  department: "แผนกเทคโนโลยีสารสนเทศ",
  role: "ADMIN",
};

export const allCategories = [
  { id: "c-it", category_name: "IT" },
  { id: "c-hosxp", category_name: "HOSxP" },
  { id: "c-printer", category_name: "Printer" },
  { id: "c-network", category_name: "Network" },
  { id: "c-lab", category_name: "Lab" },
  { id: "c-xray", category_name: "X-Ray" },
  { id: "c-sop", category_name: "SOP" },
];

export type MockArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  views: number;
  likes: number;
  comments: number;
  time: string;
  tags: string[];
  status: "PUBLISHED" | "DRAFT";
  is_pinned?: boolean;
  content: { heading: string; items: string[] }[];
};

export const articles: MockArticle[] = [
  {
    slug: "hosxp-backup-guide",
    title: "วิธีการ Backup ข้อมูล HOSxP",
    excerpt: "คู่มือการสำรองข้อมูลระบบ HOSxP อย่างถูกต้องและปลอดภัย",
    category: "HOSxP",
    author: "คุณสมชาย จ.",
    views: 245,
    likes: 32,
    comments: 6,
    time: "2 ชม. ที่แล้ว",
    tags: ["HOSxP", "Backup", "Database"],
    status: "PUBLISHED",
    is_pinned: true,
    content: [
      {
        heading: "ความสำคัญของการสำรองข้อมูล",
        items: [
          "ข้อมูลผู้ป่วยเป็นข้อมูลสำคัญที่สุดของโรงพยาบาล ต้องสำรองทุกวัน",
          "การสำรองข้อมูลช่วยป้องกันความเสียหายจาก Ransomware และฮาร์ดแวร์เสีย",
        ],
      },
      {
        heading: "ขั้นตอนการ Backup",
        items: [
          "เปิดโปรแกรม HOSxP แล้วไปที่เมนู Tools > Backup Database",
          "เลือกปลายทางเป็น Drive สำรองหรือ NAS ที่กำหนดไว้",
          "ตรวจสอบไฟล์ .sql ที่ได้ว่ามีขนาดใกล้เคียงกับครั้งก่อนหน้า",
          "บันทึกผลการสำรองข้อมูลลงในแบบฟอร์มประจำวัน",
        ],
      },
      {
        heading: "ข้อควรระวัง",
        items: [
          "ห้ามสำรองข้อมูลไว้ในเครื่องเดียวกับ Server เพียงที่เดียว",
          "ควรทดสอบ Restore อย่างน้อยเดือนละ 1 ครั้ง",
        ],
      },
    ],
  },
  {
    slug: "printer-network-setup",
    title: "การตั้งค่า Printer ผ่าน Network",
    excerpt: "ขั้นตอนการตั้งค่า Printer ให้ใช้งานร่วมกันในระบบ Network",
    category: "Printer",
    author: "คุณวิไลพร ส.",
    views: 189,
    likes: 21,
    comments: 4,
    time: "5 ชม. ที่แล้ว",
    tags: ["Printer", "Network"],
    status: "PUBLISHED",
    content: [
      {
        heading: "การเตรียมความพร้อม",
        items: [
          "ตรวจสอบว่าเครื่องพิมพ์เชื่อมต่อสาย LAN และมีไฟสถานะปกติ",
          "ขอ IP Address สำหรับเครื่องพิมพ์จากผู้ดูแลระบบเครือข่าย",
        ],
      },
      {
        heading: "ขั้นตอนการตั้งค่า",
        items: [
          "กำหนด IP แบบ Static ให้เครื่องพิมพ์ผ่านหน้าจอเครื่อง",
          "ที่เครื่องคอมพิวเตอร์ เพิ่ม Printer ผ่าน TCP/IP Port",
          "ติดตั้งไดรเวอร์รุ่นที่ตรงกับเครื่องพิมพ์ แล้วทดสอบพิมพ์",
        ],
      },
    ],
  },
  {
    slug: "ransomware-prevention",
    title: "แนวทางการป้องกันไวรัส Ransomware",
    excerpt: "แนวทางป้องกันและรับมือกับไวรัส Ransomware ในโรงพยาบาล",
    category: "IT",
    author: "คุณเอกชัย พ.",
    views: 312,
    likes: 45,
    comments: 9,
    time: "1 วัน ที่แล้ว",
    tags: ["Security", "Ransomware"],
    status: "PUBLISHED",
    content: [
      {
        heading: "การป้องกันเบื้องต้น",
        items: [
          "ไม่เปิดไฟล์แนบหรือลิงก์จากอีเมลที่ไม่รู้จัก",
          "อัปเดต Windows และโปรแกรมป้องกันไวรัสสม่ำเสมอ",
          "สำรองข้อมูลสำคัญแบบ Offline ทุกวัน",
        ],
      },
      {
        heading: "เมื่อสงสัยว่าติดไวรัส",
        items: [
          "ถอดสาย LAN ออกจากเครื่องทันที",
          "แจ้งแผนก IT ที่เบอร์ภายใน 1234 ห้ามพยายามแก้ไขเอง",
        ],
      },
    ],
  },
  {
    slug: "hosxp-permission-check",
    title: "การตรวจสอบสิทธิการใช้งาน HOSxP",
    excerpt: "วิธีตรวจสอบและแก้ไขปัญหาสิทธิการใช้งานในระบบ HOSxP",
    category: "HOSxP",
    author: "คุณธิติศักดิ์ น.",
    views: 156,
    likes: 14,
    comments: 2,
    time: "1 วัน ที่แล้ว",
    tags: ["HOSxP", "Permission"],
    status: "PUBLISHED",
    content: [
      {
        heading: "ขั้นตอนการตรวจสอบ",
        items: [
          "เข้าเมนู System > User Management ด้วยบัญชีผู้ดูแล",
          "ค้นหาชื่อผู้ใช้งาน แล้วตรวจสอบกลุ่มสิทธิที่ได้รับ",
          "หากสิทธิไม่ถูกต้อง ให้บันทึกคำขอแก้ไขตามแบบฟอร์ม IT-03",
        ],
      },
    ],
  },
  {
    slug: "vlan-switch-config",
    title: "พื้นฐานการตั้งค่า VLAN บน Switch",
    excerpt: "ทำความเข้าใจ VLAN และการแบ่งเครือข่ายภายในโรงพยาบาล",
    category: "Network",
    author: "คุณอนันต์ ก.",
    views: 134,
    likes: 18,
    comments: 3,
    time: "2 วัน ที่แล้ว",
    tags: ["Network", "VLAN", "Switch"],
    status: "PUBLISHED",
    content: [
      {
        heading: "VLAN คืออะไร",
        items: [
          "VLAN ช่วยแบ่งเครือข่ายออกเป็นส่วน ๆ เพื่อความปลอดภัยและลด Broadcast",
          "โรงพยาบาลแบ่ง VLAN ตามงาน เช่น OPD, LAB, X-Ray, สำนักงาน",
        ],
      },
      {
        heading: "ตัวอย่างการตั้งค่า",
        items: [
          "สร้าง VLAN ID และตั้งชื่อให้สื่อความหมาย",
          "กำหนดพอร์ตเป็น Access หรือ Trunk ตามการใช้งาน",
          "ทดสอบด้วยการ ping ข้าม VLAN ผ่าน Gateway",
        ],
      },
    ],
  },
  {
    slug: "lab-cbc-error-codes",
    title: "รวมรหัส Error เครื่อง CBC และวิธีแก้เบื้องต้น",
    excerpt: "คู่มืออ้างอิงรหัสข้อผิดพลาดของเครื่องตรวจ CBC ในห้อง Lab",
    category: "Lab",
    author: "คุณพรทิพย์ ล.",
    views: 98,
    likes: 11,
    comments: 1,
    time: "3 วัน ที่แล้ว",
    tags: ["Lab", "CBC"],
    status: "PUBLISHED",
    content: [
      {
        heading: "รหัสที่พบบ่อย",
        items: [
          "E-01: น้ำยาใกล้หมด — เปลี่ยนน้ำยาตามคู่มือแล้ว Prime ระบบใหม่",
          "E-05: ตัวอย่างอุดตัน — รัน Cleaning Cycle 2 รอบ",
          "E-12: อุณหภูมิผิดปกติ — ตรวจสอบแอร์ห้อง Lab และพัดลมเครื่อง",
        ],
      },
    ],
  },
  {
    slug: "xray-pacs-troubleshoot",
    title: "แก้ปัญหาภาพ X-Ray ไม่ขึ้นระบบ PACS",
    excerpt: "แนวทางตรวจสอบเมื่อภาพถ่ายรังสีไม่ปรากฏในระบบ PACS",
    category: "X-Ray",
    author: "คุณสุนธร ว.",
    views: 76,
    likes: 8,
    comments: 2,
    time: "4 วัน ที่แล้ว",
    tags: ["X-Ray", "PACS"],
    status: "PUBLISHED",
    content: [
      {
        heading: "ลำดับการตรวจสอบ",
        items: [
          "ตรวจสอบสถานะการส่งภาพที่เครื่อง Modality",
          "ping ไปยัง PACS Server ว่าเครือข่ายปกติ",
          "ตรวจสอบ Worklist ว่าข้อมูลผู้ป่วยตรงกับ HIS",
          "หากยังไม่พบภาพ ให้แจ้งผู้ดูแล PACS เพื่อตรวจสอบ Queue",
        ],
      },
    ],
  },
  {
    slug: "sop-new-employee-it",
    title: "SOP การขอบัญชีผู้ใช้งานสำหรับพนักงานใหม่",
    excerpt: "ขั้นตอนมาตรฐานการขอ Username / Email / สิทธิ HOSxP สำหรับพนักงานใหม่",
    category: "SOP",
    author: "คุณจิราภรณ์ ม.",
    views: 210,
    likes: 27,
    comments: 5,
    time: "5 วัน ที่แล้ว",
    tags: ["SOP", "Onboarding"],
    status: "PUBLISHED",
    content: [
      {
        heading: "เอกสารที่ต้องใช้",
        items: [
          "แบบฟอร์ม IT-01 (ขอบัญชีผู้ใช้งาน) ลงนามโดยหัวหน้าแผนก",
          "สำเนาคำสั่งบรรจุหรือสัญญาจ้าง",
        ],
      },
      {
        heading: "ขั้นตอน",
        items: [
          "ยื่นแบบฟอร์มที่แผนก IT ล่วงหน้าอย่างน้อย 3 วันทำการ",
          "IT สร้างบัญชีและกำหนดสิทธิตามตำแหน่งงาน",
          "พนักงานใหม่เข้ารับการอบรมการใช้งานระบบก่อนรับรหัสผ่าน",
        ],
      },
    ],
  },
];

export type MockReply = {
  id: string;
  author: string;
  is_anonymous?: boolean;
  is_best_answer?: boolean;
  time: string;
  content: string;
  likes: number;
};

export type MockDiscussion = {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  is_anonymous?: boolean;
  is_solved?: boolean;
  time: string;
  views: number;
  likes: number;
  tags: string[];
  replies: MockReply[];
};

export const discussions: MockDiscussion[] = [
  {
    id: "1",
    title: "Printer OPD ชั้น 1 พิมพ์ไม่ได้",
    content:
      "เครื่องพิมพ์ใบสั่งยาที่ OPD ชั้น 1 กดพิมพ์แล้วไม่มีอะไรออกมาเลยครับ ไฟเครื่องติดปกติ ลองปิดเปิดใหม่แล้วก็ยังไม่ได้ รบกวนขอแนวทางแก้ไขด้วยครับ",
    category: "Printer",
    author: "ประยุงใจ",
    is_solved: true,
    time: "3 ชม. ที่แล้ว",
    views: 123,
    likes: 4,
    tags: ["Printer", "OPD"],
    replies: [
      {
        id: "r1",
        author: "คุณณัฐวุฒิ",
        is_best_answer: true,
        time: "2 ชม. ที่แล้ว",
        content:
          "ให้ลองเช็ค Print Queue ก่อนครับ เปิด Devices and Printers > คลิกขวาเครื่องพิมพ์ > See what's printing ถ้ามีงานค้างให้ Cancel ทั้งหมดแล้วลองพิมพ์ใหม่ ส่วนใหญ่เคสนี้เกิดจากงานค้างครับ",
        likes: 6,
      },
      {
        id: "r2",
        author: "คุณวิไลพร",
        time: "2 ชม. ที่แล้ว",
        content: "เจอบ่อยเหมือนกันค่ะ บางทีเป็นที่สาย USB หลวม ลองขยับสายดูนะคะ",
        likes: 2,
      },
      {
        id: "r3",
        author: "ประยุงใจ",
        time: "1 ชม. ที่แล้ว",
        content: "ลบงานค้างตามที่แนะนำแล้วพิมพ์ได้แล้วครับ ขอบคุณมากครับ",
        likes: 3,
      },
    ],
  },
  {
    id: "2",
    title: "HOSxP ขึ้น Error เวลาออกใบเสร็จ",
    content:
      "เวลากดออกใบเสร็จรับเงิน ระบบขึ้น Error 'Access violation at address...' แล้วโปรแกรมเด้ง ต้องเข้าใหม่ทุกครั้ง เกิดเฉพาะเครื่องการเงินช่อง 2 ค่ะ",
    category: "HOSxP",
    author: "ไม่ประสงค์ออกนาม",
    is_anonymous: true,
    time: "6 ชม. ที่แล้ว",
    views: 156,
    likes: 2,
    tags: ["HOSxP", "การเงิน"],
    replies: [
      {
        id: "r1",
        author: "คุณธิติศักดิ์",
        time: "5 ชม. ที่แล้ว",
        content:
          "ลองอัปเดต HOSxP เป็นเวอร์ชันเดียวกับเครื่องอื่นดูครับ เคสนี้มักเกิดจากเวอร์ชันไม่ตรงกัน",
        likes: 4,
      },
      {
        id: "r2",
        author: "คุณสมชาย",
        time: "4 ชม. ที่แล้ว",
        content: "เช็คไดรเวอร์เครื่องพิมพ์ใบเสร็จด้วยครับ บางทีตัว Driver Slip ทำให้เด้งได้",
        likes: 1,
      },
    ],
  },
  {
    id: "3",
    title: "สอบถามการตั้งค่า VLAN บน Switch",
    content:
      "จะเพิ่มจุดบริการใหม่ที่อาคาร 3 ต้องตั้ง VLAN แยกไหมครับ แล้วขอ Config ตัวอย่างสำหรับ Switch Cisco หน่อยครับ",
    category: "Network",
    author: "คุณอนันต์",
    time: "1 วัน ที่แล้ว",
    views: 234,
    likes: 7,
    tags: ["Network", "VLAN"],
    replies: [
      {
        id: "r1",
        author: "คุณเอกชัย",
        time: "1 วัน ที่แล้ว",
        content:
          "แนะนำแยก VLAN ตามมาตรฐานของเราครับ ดูบทความ 'พื้นฐานการตั้งค่า VLAN บน Switch' ประกอบได้เลย มี Config ตัวอย่างอยู่",
        likes: 5,
      },
    ],
  },
  {
    id: "4",
    title: "Lab: เครื่อง CBC แจ้ง Error E-01",
    content: "เครื่อง CBC แจ้ง E-01 ตั้งแต่เช้า รัน QC ไม่ผ่านเลยค่ะ ต้องทำยังไงบ้างคะ",
    category: "Lab",
    author: "ประยุงใจ",
    time: "1 วัน ที่แล้ว",
    views: 98,
    likes: 1,
    tags: ["Lab", "CBC"],
    replies: [
      {
        id: "r1",
        author: "คุณพรทิพย์",
        is_best_answer: true,
        time: "22 ชม. ที่แล้ว",
        content:
          "E-01 คือน้ำยาใกล้หมดค่ะ เปลี่ยนน้ำยาแล้ว Prime ระบบใหม่ตามคู่มือ จากนั้นรัน QC อีกรอบ ถ้ายังไม่ผ่านค่อยแจ้งช่างค่ะ",
        likes: 8,
      },
    ],
  },
  {
    id: "5",
    title: "ขอแนวทางการสำรองข้อมูลรายวัน",
    content:
      "แผนกผมมีไฟล์ Excel ทะเบียนงานที่สำคัญมาก อยากได้แนวทางสำรองข้อมูลรายวันแบบง่าย ๆ ที่ทำเองได้ครับ",
    category: "IT",
    author: "คุณสุนธร",
    time: "2 วัน ที่แล้ว",
    views: 76,
    likes: 3,
    tags: ["Backup"],
    replies: [
      {
        id: "r1",
        author: "คุณณัฐวุฒิ",
        time: "2 วัน ที่แล้ว",
        content:
          "ใช้โฟลเดอร์แชร์บน File Server ของโรงพยาบาลครับ ระบบสำรองให้อัตโนมัติทุกคืน ถ้าเก็บไว้ในเครื่องตัวเองอย่างเดียวเสี่ยงข้อมูลหายครับ",
        likes: 4,
      },
    ],
  },
];

export const notifications = [
  {
    id: "n1",
    type: "REPLY",
    title: "มีคำตอบใหม่ในกระทู้ของคุณ",
    message: "คุณวิไลพร ตอบกระทู้ 'Printer OPD ชั้น 1 พิมพ์ไม่ได้'",
    url: "/discussions/1",
    is_read: false,
    time: "10 นาทีที่แล้ว",
  },
  {
    id: "n2",
    type: "BEST_ANSWER",
    title: "คำตอบของคุณถูกเลือกเป็นคำตอบที่ดีที่สุด",
    message: "ในกระทู้ 'Printer OPD ชั้น 1 พิมพ์ไม่ได้'",
    url: "/discussions/1",
    is_read: false,
    time: "1 ชม. ที่แล้ว",
  },
  {
    id: "n3",
    type: "LIKE",
    title: "มีคนถูกใจบทความของคุณ",
    message: "บทความ 'วิธีการ Backup ข้อมูล HOSxP' ได้รับ 5 ไลค์ใหม่",
    url: "/articles/hosxp-backup-guide",
    is_read: true,
    time: "3 ชม. ที่แล้ว",
  },
  {
    id: "n4",
    type: "COMMENT",
    title: "มีความคิดเห็นใหม่",
    message: "คุณเอกชัย แสดงความคิดเห็นในบทความของคุณ",
    url: "/articles/hosxp-backup-guide",
    is_read: true,
    time: "1 วัน ที่แล้ว",
  },
  {
    id: "n5",
    type: "SYSTEM",
    title: "ประกาศจากระบบ",
    message: "ระบบจะปิดปรับปรุงวันเสาร์ที่ 26 ก.ค. เวลา 20:00-22:00 น.",
    url: "/notifications",
    is_read: true,
    time: "2 วัน ที่แล้ว",
  },
];

export const conversations = [
  {
    id: "cv1",
    type: "DIRECT",
    name: "คุณสมชาย จ.",
    last_message: "เดี๋ยวพรุ่งนี้ผมขึ้นไปดูเครื่องให้ครับ",
    time: "5 นาทีที่แล้ว",
    unread: 2,
    online: true,
  },
  {
    id: "cv2",
    type: "GROUP",
    name: "ทีม IT Support",
    last_message: "คุณวิไลพร: สรุปงานวันนี้ตามไฟล์แนบเลยนะคะ",
    time: "30 นาทีที่แล้ว",
    unread: 0,
    online: false,
  },
  {
    id: "cv3",
    type: "DIRECT",
    name: "คุณพรทิพย์ ล.",
    last_message: "ขอบคุณค่ะ เครื่อง CBC ใช้ได้แล้ว",
    time: "2 ชม. ที่แล้ว",
    unread: 0,
    online: true,
  },
  {
    id: "cv4",
    type: "GROUP",
    name: "ประสานงานอาคาร 3",
    last_message: "คุณอนันต์: จุดติดตั้ง Switch ใหม่ตามแปลนครับ",
    time: "เมื่อวาน",
    unread: 0,
    online: false,
  },
];

export const chatMessages = [
  { id: "m1", from: "them", author: "คุณสมชาย จ.", text: "พี่ครับ เครื่องคอมห้องยา ชั้น 2 เปิดไม่ติดครับ", time: "14:02" },
  { id: "m2", from: "me", author: "คุณณัฐวุฒิ", text: "ไฟเข้าไหมครับ ลองเช็คปลั๊กกับสวิตช์รางก่อน", time: "14:03" },
  { id: "m3", from: "them", author: "คุณสมชาย จ.", text: "ไฟเข้าปกติครับ กดเปิดแล้วพัดลมหมุนแป๊บเดียวแล้วดับ", time: "14:05" },
  { id: "m4", from: "me", author: "คุณณัฐวุฒิ", text: "อาการนี้น่าจะ PSU ครับ เดี๋ยวผมเอาตัวสำรองขึ้นไปเปลี่ยนให้", time: "14:06" },
  { id: "m5", from: "them", author: "คุณสมชาย จ.", text: "เดี๋ยวพรุ่งนี้ผมขึ้นไปดูเครื่องให้ครับ", time: "14:10" },
];

export const bookmarks = [
  { id: "b1", kind: "article" as const, ref: "hosxp-backup-guide", saved_at: "2 วันที่แล้ว" },
  { id: "b2", kind: "article" as const, ref: "ransomware-prevention", saved_at: "3 วันที่แล้ว" },
  { id: "b3", kind: "discussion" as const, ref: "3", saved_at: "1 สัปดาห์ที่แล้ว" },
  { id: "b4", kind: "article" as const, ref: "sop-new-employee-it", saved_at: "2 สัปดาห์ที่แล้ว" },
];

export const adminUsers = [
  { id: "u-1", name: "ณัฐวุฒิ ใจดี", username: "nattawut.j", employee_no: "EMP-1042", department: "เทคโนโลยีสารสนเทศ", role: "ADMIN", is_active: true },
  { id: "u-2", name: "สมชาย จริงใจ", username: "somchai.c", employee_no: "EMP-1055", department: "เทคโนโลยีสารสนเทศ", role: "STAFF", is_active: true },
  { id: "u-3", name: "วิไลพร สุขสม", username: "wilaiporn.s", employee_no: "EMP-0871", department: "ผู้ป่วยนอก", role: "STAFF", is_active: true },
  { id: "u-4", name: "พรทิพย์ ลาภดี", username: "porntip.l", employee_no: "EMP-0623", department: "ห้องปฏิบัติการ", role: "STAFF", is_active: true },
  { id: "u-5", name: "อดีตพนักงาน ทดสอบ", username: "old.staff", employee_no: "EMP-0102", department: "ทรัพยากรบุคคล", role: "STAFF", is_active: false },
];

export const adminReports = [
  { id: "rp1", target: "กระทู้: ขายของออนไลน์ราคาถูก", type: "กระทู้", reason: "สแปม/โฆษณา", reporter: "คุณวิไลพร ส.", status: "PENDING" as const, time: "1 ชม. ที่แล้ว" },
  { id: "rp2", target: "ความคิดเห็นในบทความ 'วิธีการ Backup ข้อมูล HOSxP'", type: "ความคิดเห็น", reason: "ใช้ถ้อยคำไม่เหมาะสม", reporter: "คุณสมชาย จ.", status: "PENDING" as const, time: "5 ชม. ที่แล้ว" },
  { id: "rp3", target: "คำตอบในกระทู้ 'HOSxP ขึ้น Error เวลาออกใบเสร็จ'", type: "คำตอบ", reason: "ข้อมูลไม่ถูกต้อง", reporter: "คุณธิติศักดิ์ น.", status: "REVIEWED" as const, time: "เมื่อวาน" },
  { id: "rp4", target: "บทความ: โปรแกรมเถื่อนฟรี", type: "บทความ", reason: "ผิดนโยบายการใช้งาน", reporter: "คุณเอกชัย พ.", status: "RESOLVED" as const, time: "3 วันที่แล้ว" },
];

export const knowledgeDocs = [
  { id: "kd1", title: "คู่มือการใช้งาน HOSxP ฉบับสมบูรณ์", doc_type: "MANUAL" as const, department: "เทคโนโลยีสารสนเทศ", index_status: "DONE" as const, updated: "2 วันที่แล้ว" },
  { id: "kd2", title: "SOP การรับส่งสิ่งส่งตรวจห้อง Lab", doc_type: "SOP" as const, department: "ห้องปฏิบัติการ", index_status: "DONE" as const, updated: "1 สัปดาห์ที่แล้ว" },
  { id: "kd3", title: "FAQ ปัญหาการใช้งานเครื่องพิมพ์", doc_type: "FAQ" as const, department: "เทคโนโลยีสารสนเทศ", index_status: "INDEXING" as const, updated: "10 นาทีที่แล้ว" },
  { id: "kd4", title: "คู่มือระบบ PACS สำหรับรังสีเทคนิค", doc_type: "MANUAL" as const, department: "รังสีวิทยา", index_status: "FAILED" as const, updated: "1 ชม. ที่แล้ว" },
];

export const systemSettings = [
  { key: "site_announcement", label: "ประกาศหน้าแรก", value: "ระบบจะปิดปรับปรุงวันเสาร์ที่ 26 ก.ค. เวลา 20:00-22:00 น.", description: "ข้อความประกาศที่แสดงบนหน้าแรกของระบบ" },
  { key: "allow_registration", label: "เปิดรับสมัครสมาชิก", value: "true", description: "อนุญาตให้พนักงานสมัครสมาชิกด้วยตนเอง" },
  { key: "ai_search_enabled", label: "เปิดใช้งาน AI Search", value: "true", description: "เปิด/ปิดฟีเจอร์ค้นหาด้วย AI ทั้งระบบ" },
  { key: "max_upload_mb", label: "ขนาดไฟล์อัปโหลดสูงสุด (MB)", value: "10", description: "จำกัดขนาดไฟล์แนบต่อไฟล์" },
];

export const myArticles = [
  { slug: "hosxp-backup-guide", title: "วิธีการ Backup ข้อมูล HOSxP", status: "PUBLISHED" as const, views: 245, likes: 32, time: "2 ชม. ที่แล้ว" },
  { slug: "draft-network-diagram", title: "ผังเครือข่ายอาคารใหม่ (ฉบับร่าง)", status: "DRAFT" as const, views: 0, likes: 0, time: "3 วันที่แล้ว" },
];

export const myDiscussions = [
  { id: "1", title: "Printer OPD ชั้น 1 พิมพ์ไม่ได้", replies: 3, is_solved: true, time: "3 ชม. ที่แล้ว" },
];
