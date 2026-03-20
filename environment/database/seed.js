/**
 * Comprehensive seed — 20 rows per major table.
 * Insertion order respects all foreign key constraints.
 *
 * Run from project root: node environment/database/seed.js
 */

const path = require("path");
const BACKEND = path.resolve(__dirname, "../../backend");
const dotenv = require(path.join(BACKEND, "node_modules/dotenv"));
dotenv.config({ path: path.join(BACKEND, ".env") });
const { PrismaClient } = require(path.join(BACKEND, "node_modules/@prisma/client"));
const bcrypt = require(path.join(BACKEND, "node_modules/bcryptjs"));
const prisma = new PrismaClient();

// ─── helpers ──────────────────────────────────────────────────────────────────
function d(dateStr) { return new Date(dateStr); }
async function skip(table, condition) {
  // For tables without unique constraints, skip if already seeded
  const count = await prisma[table].count({ where: condition });
  return count > 0;
}

async function main() {
  console.log("Seeding database…\n");

  // ══════════════════════════════════════════════════════════════
  // 1. ROLES  (4 — enum-like)
  // ══════════════════════════════════════════════════════════════
  const roleDefs = [
    { code: "admin",               roleName: "Admin" },
    { code: "student",             roleName: "Student" },
    { code: "organization_leader", roleName: "Organization Leader" },
    { code: "organization_member", roleName: "Organization Member" },
  ];
  const roles = {};
  for (const r of roleDefs) {
    const role = await prisma.role.upsert({ where: { code: r.code }, update: {}, create: r });
    roles[r.code] = role;
  }
  console.log("✓ roles (4)");

  // ══════════════════════════════════════════════════════════════
  // 1b. SYSTEM CONFIGS (default global configs)
  // ══════════════════════════════════════════════════════════════
  const defaultConfigs = [
    {
      key: "activity.require_approval",
      value: { enabled: true },
      dataType: "boolean",
      category: "activity",
      label: "Yeu cau admin duyet bai dang",
      description: "Khi bat, bai dang cua to chuc phai qua admin duyet truoc khi hien thi",
    },
    {
      key: "activity.max_per_org_per_month",
      value: { value: 0 },
      dataType: "number",
      category: "activity",
      label: "So bai dang toi da moi to chuc moi thang",
      description: "Gioi han so bai dang moi to chuc duoc tao trong 1 thang (0 = khong gioi han)",
    },
    {
      key: "registration.auto_approve",
      value: { enabled: false },
      dataType: "boolean",
      category: "registration",
      label: "Tu dong duyet dang ky tham gia",
      description: "Khi bat, dang ky se duoc duyet tu dong thay vi cho to chuc duyet",
    },
    {
      key: "registration.allow_cancel_after_approve",
      value: { enabled: true },
      dataType: "boolean",
      category: "registration",
      label: "Cho huy sau khi da duyet",
      description: "Cho phep sinh vien huy dang ky sau khi da duoc duyet",
    },
    {
      key: "organization.require_approval_for_new",
      value: { enabled: false },
      dataType: "boolean",
      category: "organization",
      label: "To chuc moi can admin duyet",
      description: "Khi bat, to chuc moi tao phai duoc admin phe duyet truoc khi hoat dong",
    },
    {
      key: "system.maintenance_mode",
      value: { enabled: false },
      dataType: "boolean",
      category: "system",
      label: "Che do bao tri",
      description: "Bat che do bao tri, chi admin moi truy cap duoc he thong",
    },
  ];

  for (const cfg of defaultConfigs) {
    const existing = await prisma.systemConfig.findFirst({
      where: { key: cfg.key, organizationId: null },
    });
    if (!existing) {
      await prisma.systemConfig.create({ data: { ...cfg, organizationId: null } });
    }
  }
  console.log(`✓ system_configs (${defaultConfigs.length})`);

  // ══════════════════════════════════════════════════════════════
  // 2. USERS  (20)
  // ══════════════════════════════════════════════════════════════
  const usersData = [
    { userName:"Admin User",           email:"admin@test.com",    pwd:"Admin@123",   role:"admin",               sid:null,    phone:"0900000000" },
    { userName:"Trần Minh Khoa",       email:"leader1@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20001", phone:"0901000001" },
    { userName:"Nguyễn Thị Lan",       email:"leader2@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20002", phone:"0901000002" },
    { userName:"Phạm Quốc Hùng",       email:"leader3@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20003", phone:"0901000003" },
    { userName:"Đỗ Thị Mai",           email:"leader4@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20004", phone:"0901000004" },
    { userName:"Vũ Đức Thành",         email:"leader5@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20005", phone:"0901000005" },
    { userName:"Lê Ngọc Trinh",        email:"leader6@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20006", phone:"0901000006" },
    { userName:"Bùi Văn Hải",          email:"leader7@test.com",  pwd:"Leader@123",  role:"organization_leader", sid:"20007", phone:"0901000007" },
    { userName:"Lê Văn Dũng",          email:"member1@test.com",  pwd:"Member@123",  role:"organization_member", sid:"20008", phone:"0902000001" },
    { userName:"Phạm Thị Hoa",         email:"member2@test.com",  pwd:"Member@123",  role:"organization_member", sid:"20009", phone:"0902000002" },
    { userName:"Ngô Tuấn Kiệt",        email:"member3@test.com",  pwd:"Member@123",  role:"organization_member", sid:"20010", phone:"0902000003" },
    { userName:"Trương Thị Thanh",     email:"member4@test.com",  pwd:"Member@123",  role:"organization_member", sid:"20011", phone:"0902000004" },
    { userName:"Nguyễn Văn An",        email:"student1@test.com", pwd:"Student@123", role:"student",             sid:"21001", phone:"0903000001" },
    { userName:"Trần Thị Bích",        email:"student2@test.com", pwd:"Student@123", role:"student",             sid:"21002", phone:"0903000002" },
    { userName:"Hoàng Văn Cường",      email:"student3@test.com", pwd:"Student@123", role:"student",             sid:"21003", phone:"0903000003" },
    { userName:"Nguyễn Thị Dung",      email:"student4@test.com", pwd:"Student@123", role:"student",             sid:"21004", phone:"0903000004" },
    { userName:"Phan Trọng Đức",       email:"student5@test.com", pwd:"Student@123", role:"student",             sid:"21005", phone:"0903000005" },
    { userName:"Lý Thị Phương",        email:"student6@test.com", pwd:"Student@123", role:"student",             sid:"21006", phone:"0903000006" },
    { userName:"Đinh Văn Quân",        email:"student7@test.com", pwd:"Student@123", role:"student",             sid:"21007", phone:"0903000007" },
    { userName:"Bùi Thị Như",          email:"student8@test.com", pwd:"Student@123", role:"student",             sid:"21008", phone:"0903000008" },
  ];
  const users = {};
  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.pwd, 10);
    const user = await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: { userName: u.userName, email: u.email, password: hashed,
                studentId: u.sid, university: "Đại học Bách Khoa HCM",
                phoneNumber: u.phone, status: "active" },
    });
    // 3. USER_ROLES (20 — one per user)
    await prisma.userRole.upsert({
      where:  { userId_roleId: { userId: user.userId, roleId: roles[u.role].roleId } },
      update: {},
      create: { userId: user.userId, roleId: roles[u.role].roleId },
    });
    users[u.email] = user;
  }
  console.log("✓ users (20)");
  console.log("✓ user_roles (20)");

  const U = (e) => users[e].userId; // shorthand

  // ══════════════════════════════════════════════════════════════
  // 4. ORGANIZATIONS  (8)
  // ══════════════════════════════════════════════════════════════
  const orgsData = [
    { name:"CLB Tin Học BK",      type:"club",       logo:"056382", leader:"leader1@test.com", email:"clbtinhoc@bk.edu.vn",
      desc:"Câu lạc bộ Tin Học Bách Khoa – lập trình, công nghệ, phát triển kỹ năng thực tiễn." },
    { name:"CLB Tiếng Anh BK",    type:"club",       logo:"05566B", leader:"leader2@test.com", email:"clbtienganhbk@bk.edu.vn",
      desc:"Câu lạc bộ Tiếng Anh – môi trường lý tưởng luyện tập và nâng cao ngoại ngữ." },
    { name:"CLB Thể Thao BK",     type:"club",       logo:"E74C3C", leader:"leader3@test.com", email:"clbthethaobk@bk.edu.vn",
      desc:"Câu lạc bộ Thể Thao – rèn luyện thể chất, thi đấu, xây dựng tinh thần đồng đội." },
    { name:"CLB Âm Nhạc BK",      type:"club",       logo:"9B59B6", leader:"leader4@test.com", email:"clbamnhacbk@bk.edu.vn",
      desc:"Câu lạc bộ Âm Nhạc – sân chơi sáng tạo cho những sinh viên yêu âm nhạc." },
    { name:"CLB Thiết Kế BK",     type:"club",       logo:"F39C12", leader:"leader5@test.com", email:"clbthietkebk@bk.edu.vn",
      desc:"Câu lạc bộ Thiết Kế – phát triển tư duy sáng tạo và kỹ năng UI/UX." },
    { name:"Đoàn Thanh Niên BK",  type:"university", logo:"C0392B", leader:"leader6@test.com", email:"doanthanhnienbk@bk.edu.vn",
      desc:"Đoàn Thanh Niên Đại học Bách Khoa – tổ chức hoạt động cộng đồng và tình nguyện." },
    { name:"CLB Khoa Học BK",     type:"club",       logo:"1ABC9C", leader:"leader7@test.com", email:"clbkhoahocbk@bk.edu.vn",
      desc:"Câu lạc bộ Khoa Học – nghiên cứu, thực nghiệm, và ứng dụng khoa học cơ bản." },
    { name:"CLB Robotics BK",     type:"club",       logo:"2980B9", leader:"leader1@test.com", email:"clbroboticsbk@bk.edu.vn",
      desc:"Câu lạc bộ Robotics – thiết kế và thi đấu robot, IoT, và hệ thống nhúng." },
  ];
  const ORG_DEFAULT_PASSWORD = "Org@12345";
  const orgs = {};
  for (const o of orgsData) {
    const existing = await prisma.organization.findFirst({ where: { organizationName: o.name } });
    const org = existing ?? await prisma.organization.create({
      data: {
        organizationName: o.name, organizationType: o.type, description: o.desc,
        email: o.email,
        password: await bcrypt.hash(ORG_DEFAULT_PASSWORD, 10),
        logoUrl:      `https://placehold.co/200x200/${o.logo}/white?text=${encodeURIComponent(o.name.slice(0,6))}`,
        coverImageUrl:`https://placehold.co/1200x400/${o.logo}/white?text=${encodeURIComponent(o.name)}`,
        createdBy: U("admin@test.com"),
      },
    });
    orgs[o.name] = org;
  }
  console.log("✓ organizations (8) — password: Org@12345");

  // ══════════════════════════════════════════════════════════════
  // 5. ORGANIZATION_MEMBERS  (20)
  //    8 presidents + 12 regular members
  // ══════════════════════════════════════════════════════════════
  const orgByIdx = Object.values(orgs); // [org0..org7]
  const memberPairs = [
    // 8 presidents
    { email:"leader1@test.com", org:"CLB Tin Học BK",     role:"president" },
    { email:"leader2@test.com", org:"CLB Tiếng Anh BK",   role:"president" },
    { email:"leader3@test.com", org:"CLB Thể Thao BK",    role:"president" },
    { email:"leader4@test.com", org:"CLB Âm Nhạc BK",     role:"president" },
    { email:"leader5@test.com", org:"CLB Thiết Kế BK",    role:"president" },
    { email:"leader6@test.com", org:"Đoàn Thanh Niên BK", role:"president" },
    { email:"leader7@test.com", org:"CLB Khoa Học BK",    role:"president" },
    { email:"leader1@test.com", org:"CLB Robotics BK",    role:"president" },
    // 12 regular members
    { email:"member1@test.com", org:"CLB Tin Học BK",     role:"member" },
    { email:"member1@test.com", org:"CLB Robotics BK",    role:"member" },
    { email:"member2@test.com", org:"CLB Tiếng Anh BK",   role:"member" },
    { email:"member2@test.com", org:"CLB Âm Nhạc BK",     role:"member" },
    { email:"member3@test.com", org:"CLB Thể Thao BK",    role:"member" },
    { email:"member3@test.com", org:"CLB Khoa Học BK",    role:"member" },
    { email:"member4@test.com", org:"CLB Thiết Kế BK",    role:"member" },
    { email:"member4@test.com", org:"Đoàn Thanh Niên BK", role:"member" },
    { email:"student1@test.com", org:"CLB Tin Học BK",    role:"member" },
    { email:"student2@test.com", org:"CLB Tiếng Anh BK",  role:"member" },
    { email:"student3@test.com", org:"CLB Thể Thao BK",   role:"member" },
    { email:"student4@test.com", org:"CLB Âm Nhạc BK",    role:"member" },
  ];
  for (const mp of memberPairs) {
    const org = orgs[mp.org];
    await prisma.organizationMember.upsert({
      where:  { userId_organizationId: { userId: U(mp.email), organizationId: org.organizationId } },
      update: {},
      create: { userId: U(mp.email), organizationId: org.organizationId, role: mp.role, joinDate: new Date() },
    });
  }
  console.log("✓ organization_members (20)");

  // ══════════════════════════════════════════════════════════════
  // 6. ORGANIZATION_DOCUMENTS  (20)
  // ══════════════════════════════════════════════════════════════
  if (!(await skip("organizationDocument", {}))) {
    const docData = [
      { name:"Quy chế CLB Tin Học 2026",       cat:"quy_che",   org:"CLB Tin Học BK",     email:"leader1@test.com" },
      { name:"Kế hoạch hoạt động Q1-2026",     cat:"ke_hoach",  org:"CLB Tin Học BK",     email:"leader1@test.com" },
      { name:"Danh sách thành viên 2026",       cat:"danh_sach", org:"CLB Tin Học BK",     email:"member1@test.com" },
      { name:"Quy chế CLB Tiếng Anh 2026",     cat:"quy_che",   org:"CLB Tiếng Anh BK",   email:"leader2@test.com" },
      { name:"Lịch sinh hoạt định kỳ 2026",    cat:"lich",      org:"CLB Tiếng Anh BK",   email:"leader2@test.com" },
      { name:"Báo cáo hoạt động Q4-2025",      cat:"bao_cao",   org:"CLB Tiếng Anh BK",   email:"member2@test.com" },
      { name:"Quy chế CLB Thể Thao 2026",      cat:"quy_che",   org:"CLB Thể Thao BK",    email:"leader3@test.com" },
      { name:"Lịch thi đấu BK Cup 2026",       cat:"lich",      org:"CLB Thể Thao BK",    email:"leader3@test.com" },
      { name:"Danh sách đội bóng 2026",        cat:"danh_sach", org:"CLB Thể Thao BK",    email:"member3@test.com" },
      { name:"Quy chế CLB Âm Nhạc 2026",      cat:"quy_che",   org:"CLB Âm Nhạc BK",     email:"leader4@test.com" },
      { name:"Chương trình Spring Concert",    cat:"chuong_trinh", org:"CLB Âm Nhạc BK",  email:"leader4@test.com" },
      { name:"Danh sách nhạc cụ CLB",         cat:"danh_sach", org:"CLB Âm Nhạc BK",     email:"member2@test.com" },
      { name:"Quy chế CLB Thiết Kế 2026",     cat:"quy_che",   org:"CLB Thiết Kế BK",    email:"leader5@test.com" },
      { name:"Portfolio showcase 2026",        cat:"portfolio", org:"CLB Thiết Kế BK",    email:"leader5@test.com" },
      { name:"Hướng dẫn dùng Figma",          cat:"huong_dan", org:"CLB Thiết Kế BK",    email:"member4@test.com" },
      { name:"Kế hoạch Mùa Hè Xanh 2026",     cat:"ke_hoach",  org:"Đoàn Thanh Niên BK", email:"leader6@test.com" },
      { name:"Báo cáo tình nguyện 2025",       cat:"bao_cao",   org:"Đoàn Thanh Niên BK", email:"leader6@test.com" },
      { name:"Danh sách tình nguyện viên",     cat:"danh_sach", org:"Đoàn Thanh Niên BK", email:"member4@test.com" },
      { name:"Quy chế CLB Khoa Học 2026",     cat:"quy_che",   org:"CLB Khoa Học BK",    email:"leader7@test.com" },
      { name:"Lịch thực nghiệm Lab 2026",     cat:"lich",      org:"CLB Khoa Học BK",    email:"leader7@test.com" },
    ];
    await prisma.organizationDocument.createMany({
      data: docData.map(d => ({
        documentName:   d.name,
        fileUrl:        `https://example.com/docs/${encodeURIComponent(d.name)}.pdf`,
        category:       d.cat,
        organizationId: orgs[d.org].organizationId,
        userId:         U(d.email),
        createdBy:      U(d.email),
      })),
    });
  }
  console.log("✓ organization_documents (20)");

  // ══════════════════════════════════════════════════════════════
  // 7. ACTIVITY_CATEGORIES  (5)
  // ══════════════════════════════════════════════════════════════
  const catNames = ["Công nghệ", "Học thuật", "Thể thao", "Văn hóa - Nghệ thuật", "Tình nguyện"];
  const cats = {};
  for (const name of catNames) {
    const cat = await prisma.activityCategory.upsert({
      where:  { categoryName: name },
      update: {},
      create: { categoryName: name, createdBy: U("admin@test.com") },
    });
    cats[name] = cat;
  }
  console.log("✓ activity_categories (5)");

  // ══════════════════════════════════════════════════════════════
  // 8. ACTIVITIES  (20)
  //    14 competition/program  +  6 recruitment
  // ══════════════════════════════════════════════════════════════
  const activitiesData = [
    // ── competitions / programs (eligible for Registration) ────
    { name:"Hackathon BK 2026",
      desc:"Cuộc thi lập trình 24 giờ toàn trường. Giải thưởng đến 50 triệu đồng.",
      img:"056382", loc:"Hội trường A4", type:"competition", team:"team",
      start:"2026-04-15T08:00:00Z", end:"2026-04-16T08:00:00Z", deadline:"2026-04-10T23:59:59Z",
      max:200, prize:"Nhất: 20tr, Nhì: 10tr, Ba: 5tr", status:"published",
      org:"CLB Tin Học BK", cat:"Công nghệ" },

    { name:"Workshop: Nhập môn AI & Machine Learning",
      desc:"Workshop thực hành AI/ML cho sinh viên chưa có kinh nghiệm.",
      img:"05566B", loc:"Lab B6", type:"program", team:"individual",
      start:"2026-04-20T13:30:00Z", end:"2026-04-20T17:30:00Z", deadline:"2026-04-18T23:59:59Z",
      max:50, prize:null, status:"published",
      org:"CLB Tin Học BK", cat:"Công nghệ" },

    { name:"Seminar: Xu hướng Công nghệ 2026",
      desc:"Diễn giả từ các công ty hàng đầu chia sẻ GenAI, Web3, Cybersecurity.",
      img:"2980B9", loc:"Hội trường B9", type:"program", team:"individual",
      start:"2026-05-05T08:00:00Z", end:"2026-05-05T12:00:00Z", deadline:"2026-05-03T23:59:59Z",
      max:150, prize:null, status:"published",
      org:"CLB Tin Học BK", cat:"Công nghệ" },

    { name:"Cuộc thi Lập trình Thuật toán BK 2026",
      desc:"Competitive Programming vòng loại online, chung kết tại trường.",
      img:"1ABC9C", loc:"Phòng máy H1-301", type:"competition", team:"individual",
      start:"2026-06-10T08:00:00Z", end:"2026-06-10T17:00:00Z", deadline:"2026-06-05T23:59:59Z",
      max:120, prize:"Nhất: 10tr, Nhì: 5tr", status:"published",
      org:"CLB Tin Học BK", cat:"Công nghệ" },

    { name:"English Speaking Club – Tháng 4",
      desc:"Sinh hoạt tiếng Anh định kỳ. Chủ đề: Technology & Future.",
      img:"2ECC71", loc:"Phòng 102, Nhà B12", type:"program", team:"individual",
      start:"2026-04-12T08:00:00Z", end:"2026-04-12T11:00:00Z", deadline:"2026-04-11T23:59:59Z",
      max:40, prize:null, status:"published",
      org:"CLB Tiếng Anh BK", cat:"Học thuật" },

    { name:"Cuộc thi Hùng biện Tiếng Anh 2026",
      desc:"Hùng biện cấp trường. Giải thưởng hấp dẫn cho Top 3.",
      img:"9B59B6", loc:"Hội trường B1", type:"competition", team:"individual",
      start:"2026-05-10T08:00:00Z", end:"2026-05-10T17:00:00Z", deadline:"2026-05-05T23:59:59Z",
      max:60, prize:"Nhất: 5tr, Nhì: 3tr, Ba: 1tr", status:"published",
      org:"CLB Tiếng Anh BK", cat:"Học thuật" },

    { name:"IELTS Study Group – Kỳ hè 2026",
      desc:"Nhóm học IELTS hàng tuần, tài liệu đầy đủ, miễn phí.",
      img:"3498DB", loc:"Phòng 201, Nhà B12", type:"program", team:"individual",
      start:"2026-05-15T08:00:00Z", end:"2026-07-15T11:00:00Z", deadline:"2026-05-13T23:59:59Z",
      max:30, prize:null, status:"published",
      org:"CLB Tiếng Anh BK", cat:"Học thuật" },

    { name:"Giải Bóng Đá Sinh Viên BK Cup 2026",
      desc:"Giải bóng đá truyền thống. Thi đấu vòng loại → chung kết.",
      img:"E74C3C", loc:"Sân Vận Động BK", type:"competition", team:"team",
      start:"2026-06-01T07:00:00Z", end:"2026-06-30T20:00:00Z", deadline:"2026-05-25T23:59:59Z",
      max:160, prize:"Vô địch: Cúp + 10tr, Á quân: 5tr", status:"published",
      org:"CLB Thể Thao BK", cat:"Thể thao" },

    { name:"Giải Cầu Lông BK 2026",
      desc:"Cầu lông nội bộ: đơn nam, đơn nữ, đôi hỗn hợp.",
      img:"F39C12", loc:"Nhà Thi Đấu BK", type:"competition", team:"both",
      start:"2026-05-01T08:00:00Z", end:"2026-05-15T18:00:00Z", deadline:"2026-04-28T23:59:59Z",
      max:100, prize:"Nhất mỗi nội dung: 2tr", status:"published",
      org:"CLB Thể Thao BK", cat:"Thể thao" },

    { name:"BK Run – Chạy Bộ Vì Cộng Đồng 2026",
      desc:"Sự kiện chạy bộ từ thiện 5km/10km. Mỗi km = 10.000đ quyên góp.",
      img:"27AE60", loc:"Khuôn viên BK", type:"program", team:"both",
      start:"2026-04-25T06:00:00Z", end:"2026-04-25T10:00:00Z", deadline:"2026-04-22T23:59:59Z",
      max:300, prize:null, status:"published",
      org:"CLB Thể Thao BK", cat:"Thể thao" },

    { name:"Đêm Nhạc Spring Concert 2026",
      desc:"Hội tụ tài năng âm nhạc sinh viên BK. Acoustic, indie, ballad, rap.",
      img:"8E44AD", loc:"Sân khấu NVH BK", type:"program", team:"individual",
      start:"2026-04-18T18:00:00Z", end:"2026-04-18T22:00:00Z", deadline:"2026-04-15T23:59:59Z",
      max:500, prize:null, status:"published",
      org:"CLB Âm Nhạc BK", cat:"Văn hóa - Nghệ thuật" },

    { name:"Design Challenge: UI/UX Hackathon BK 2026",
      desc:"Cuộc thi thiết kế UI/UX 48 giờ theo đội.",
      img:"F39C12", loc:"Studio Thiết Kế H6", type:"competition", team:"team",
      start:"2026-05-23T08:00:00Z", end:"2026-05-25T08:00:00Z", deadline:"2026-05-20T23:59:59Z",
      max:60, prize:"Nhất: 15tr, Nhì: 8tr", status:"published",
      org:"CLB Thiết Kế BK", cat:"Văn hóa - Nghệ thuật" },

    { name:"Workshop Figma từ cơ bản đến nâng cao",
      desc:"Thực hành Figma 2 ngày: wireframe → prototype. Có chứng nhận.",
      img:"E67E22", loc:"Phòng máy H6-201", type:"program", team:"individual",
      start:"2026-04-26T08:00:00Z", end:"2026-04-27T17:00:00Z", deadline:"2026-04-24T23:59:59Z",
      max:30, prize:null, status:"published",
      org:"CLB Thiết Kế BK", cat:"Văn hóa - Nghệ thuật" },

    { name:"Ngày hội Văn hóa Quốc tế BK 2026",
      desc:"Giao lưu văn hóa, biểu diễn nghệ thuật, ẩm thực quốc tế.",
      img:"F39C12", loc:"Sân Nhà Thể Chất BK", type:"program", team:"individual",
      start:"2026-05-20T08:00:00Z", end:"2026-05-20T20:00:00Z", deadline:"2026-05-15T23:59:59Z",
      max:500, prize:null, status:"published",
      org:"Đoàn Thanh Niên BK", cat:"Văn hóa - Nghệ thuật" },

    // ── recruitment activities (eligible for ClubApplication) ──
    { name:"Tuyển thành viên CLB Tin Học BK – Khóa 2026",
      desc:"Tuyển thành viên mới. Không yêu cầu kinh nghiệm.",
      img:"056382", loc:"VP CLB Tin Học, Nhà A1", type:"recruitment", team:"individual",
      start:"2026-04-01T08:00:00Z", end:"2026-04-30T17:00:00Z", deadline:"2026-04-25T23:59:59Z",
      max:30, prize:null, status:"published",
      org:"CLB Tin Học BK", cat:"Công nghệ" },

    { name:"Tuyển thành viên CLB Tiếng Anh BK – Khóa 2026",
      desc:"Tuyển thành viên mới. Chỉ cần đam mê và sẵn sàng học hỏi.",
      img:"05566B", loc:"VP CLB Tiếng Anh, Nhà B12", type:"recruitment", team:"individual",
      start:"2026-04-05T08:00:00Z", end:"2026-04-28T17:00:00Z", deadline:"2026-04-26T23:59:59Z",
      max:25, prize:null, status:"published",
      org:"CLB Tiếng Anh BK", cat:"Học thuật" },

    { name:"Tuyển thành viên CLB Thể Thao BK 2026",
      desc:"Tuyển các bộ môn: bóng đá, cầu lông, bơi lội. HLV chuyên nghiệp.",
      img:"E74C3C", loc:"Sân Thể Dục BK", type:"recruitment", team:"individual",
      start:"2026-03-20T08:00:00Z", end:"2026-04-10T17:00:00Z", deadline:"2026-04-08T23:59:59Z",
      max:50, prize:null, status:"published",
      org:"CLB Thể Thao BK", cat:"Thể thao" },

    { name:"Tuyển thành viên CLB Âm Nhạc BK 2026",
      desc:"Tuyển các ban: Guitar, Keyboard, Vocal, Percussion.",
      img:"9B59B6", loc:"Phòng tập nhạc NVH BK", type:"recruitment", team:"individual",
      start:"2026-04-08T08:00:00Z", end:"2026-04-22T17:00:00Z", deadline:"2026-04-20T23:59:59Z",
      max:20, prize:null, status:"published",
      org:"CLB Âm Nhạc BK", cat:"Văn hóa - Nghệ thuật" },

    { name:"Tuyển thành viên CLB Thiết Kế BK 2026",
      desc:"Tuyển designer, illustrator, UI/UX. Cần portfolio hoặc tác phẩm.",
      img:"F39C12", loc:"Studio Thiết Kế H6", type:"recruitment", team:"individual",
      start:"2026-04-10T08:00:00Z", end:"2026-04-25T17:00:00Z", deadline:"2026-04-23T23:59:59Z",
      max:15, prize:null, status:"published",
      org:"CLB Thiết Kế BK", cat:"Văn hóa - Nghệ thuật" },

    { name:"Tuyển thành viên CLB Khoa Học BK 2026",
      desc:"Tuyển nghiên cứu viên, thực nghiệm, toán – lý – hóa – sinh.",
      img:"1ABC9C", loc:"Phòng Lab Khoa Học, Nhà C3", type:"recruitment", team:"individual",
      start:"2026-04-12T08:00:00Z", end:"2026-04-30T17:00:00Z", deadline:"2026-04-28T23:59:59Z",
      max:20, prize:null, status:"published",
      org:"CLB Khoa Học BK", cat:"Học thuật" },
  ];

  const leaderByOrg = {
    "CLB Tin Học BK":    "leader1@test.com",
    "CLB Tiếng Anh BK":  "leader2@test.com",
    "CLB Thể Thao BK":   "leader3@test.com",
    "CLB Âm Nhạc BK":    "leader4@test.com",
    "CLB Thiết Kế BK":   "leader5@test.com",
    "Đoàn Thanh Niên BK":"leader6@test.com",
    "CLB Khoa Học BK":   "leader7@test.com",
    "CLB Robotics BK":   "leader1@test.com",
  };
  const activities = {};
  for (const a of activitiesData) {
    const existing = await prisma.activity.findFirst({ where: { activityName: a.name } });
    const activity = existing ?? await prisma.activity.create({
      data: {
        activityName:         a.name,   description:          a.desc,
        coverImage:           `https://placehold.co/1200x600/${a.img}/white?text=${encodeURIComponent(a.name.slice(0,20))}`,
        location:             a.loc,    activityType:         a.type,
        teamMode:             a.team,   startTime:            d(a.start),
        endTime:              d(a.end), registrationDeadline: d(a.deadline),
        maxParticipants:      a.max,    prize:                a.prize,
        activityStatus:       a.status,
        organizationId:       orgs[a.org].organizationId,
        categoryId:           cats[a.cat].categoryId,
        createdBy:            U(leaderByOrg[a.org]),
      },
    });
    activities[a.name] = activity;
  }
  console.log("✓ activities (20)");

  // Short aliases
  const aId = (n) => activities[n].activityId;

  // ══════════════════════════════════════════════════════════════
  // 9. ACTIVITY_CHECKINS  (20 — one per activity)
  // ══════════════════════════════════════════════════════════════
  const checkins = {};
  for (const [name, act] of Object.entries(activities)) {
    if (await skip("activityCheckin", { activityId: act.activityId })) {
      const existing = await prisma.activityCheckin.findFirst({ where: { activityId: act.activityId } });
      checkins[name] = existing;
    } else {
      const ci = await prisma.activityCheckin.create({
        data: {
          activityId:   act.activityId,
          checkInTime:  act.startTime,
          checkOutTime: act.endTime,
        },
      });
      checkins[name] = ci;
    }
  }
  console.log("✓ activity_checkins (20)");

  // ══════════════════════════════════════════════════════════════
  // 10. ACTIVITY_TEAM_RULES  (8 — for team/both activities)
  // ══════════════════════════════════════════════════════════════
  const teamActivities = [
    { name:"Hackathon BK 2026",                     min:2, max:5 },
    { name:"Giải Bóng Đá Sinh Viên BK Cup 2026",   min:7, max:11 },
    { name:"Giải Cầu Lông BK 2026",                min:2, max:2 },
    { name:"BK Run – Chạy Bộ Vì Cộng Đồng 2026",  min:2, max:6 },
    { name:"Design Challenge: UI/UX Hackathon BK 2026", min:2, max:4 },
  ];
  for (const ta of teamActivities) {
    await prisma.activityTeamRule.upsert({
      where:  { activityId: aId(ta.name) },
      update: {},
      create: { activityId: aId(ta.name), minTeamMembers: ta.min, maxTeamMembers: ta.max },
    });
  }
  console.log("✓ activity_team_rules (5)");

  // ══════════════════════════════════════════════════════════════
  // 11. REGISTRATIONS  (20)
  //     15 individual + 5 team
  // ══════════════════════════════════════════════════════════════
  const regData = [
    // Team registrations (5)
    { user:"student1@test.com", act:"Hackathon BK 2026",                     status:"approved", type:"team", team:"Team Alpha" },
    { user:"student5@test.com", act:"Giải Bóng Đá Sinh Viên BK Cup 2026",   status:"approved", type:"team", team:"FC BK Stars" },
    { user:"student2@test.com", act:"Design Challenge: UI/UX Hackathon BK 2026", status:"pending", type:"team", team:"Pixel Craft" },
    { user:"student6@test.com", act:"BK Run – Chạy Bộ Vì Cộng Đồng 2026",  status:"approved", type:"team", team:"Run Squad BK" },
    { user:"student3@test.com", act:"Giải Cầu Lông BK 2026",                status:"approved", type:"team", team:"Smash BK" },
    // Individual registrations (15)
    { user:"student2@test.com", act:"Hackathon BK 2026",                     status:"pending",  type:"individual", team:null },
    { user:"student3@test.com", act:"Workshop: Nhập môn AI & Machine Learning", status:"approved", type:"individual", team:null },
    { user:"student4@test.com", act:"Workshop: Nhập môn AI & Machine Learning", status:"approved", type:"individual", team:null },
    { user:"student5@test.com", act:"Seminar: Xu hướng Công nghệ 2026",     status:"approved", type:"individual", team:null },
    { user:"student1@test.com", act:"English Speaking Club – Tháng 4",       status:"approved", type:"individual", team:null },
    { user:"student4@test.com", act:"English Speaking Club – Tháng 4",       status:"approved", type:"individual", team:null },
    { user:"student7@test.com", act:"Cuộc thi Hùng biện Tiếng Anh 2026",   status:"approved", type:"individual", team:null },
    { user:"student8@test.com", act:"Cuộc thi Hùng biện Tiếng Anh 2026",   status:"pending",  type:"individual", team:null },
    { user:"student6@test.com", act:"IELTS Study Group – Kỳ hè 2026",       status:"approved", type:"individual", team:null },
    { user:"student1@test.com", act:"Đêm Nhạc Spring Concert 2026",         status:"approved", type:"individual", team:null },
    { user:"student2@test.com", act:"Đêm Nhạc Spring Concert 2026",         status:"approved", type:"individual", team:null },
    { user:"student7@test.com", act:"Workshop Figma từ cơ bản đến nâng cao", status:"approved", type:"individual", team:null },
    { user:"student8@test.com", act:"Ngày hội Văn hóa Quốc tế BK 2026",    status:"approved", type:"individual", team:null },
    { user:"student3@test.com", act:"Ngày hội Văn hóa Quốc tế BK 2026",    status:"approved", type:"individual", team:null },
    { user:"student4@test.com", act:"Cuộc thi Lập trình Thuật toán BK 2026", status:"pending", type:"individual", team:null },
  ];
  const regs = {};
  for (const r of regData) {
    const existing = await prisma.registration.findFirst({
      where: { userId: U(r.user), activityId: aId(r.act) },
    });
    const reg = existing ?? await prisma.registration.create({
      data: {
        userId: U(r.user), activityId: aId(r.act),
        status: r.status, registrationType: r.type,
        teamName: r.team,
      },
    });
    regs[`${r.user}|${r.act}`] = reg;
  }
  console.log("✓ registrations (20)");

  // ══════════════════════════════════════════════════════════════
  // 12. REGISTRATION_CHECKINS  (20 — one per registration)
  // ══════════════════════════════════════════════════════════════
  for (const r of regData) {
    const reg = regs[`${r.user}|${r.act}`];
    const ci  = checkins[r.act];
    if (!reg || !ci) continue;
    if (await skip("registrationCheckin", { registrationId: reg.registrationId })) continue;
    await prisma.registrationCheckin.create({
      data: {
        registrationId:    reg.registrationId,
        activityCheckinId: ci.checkinId,
        checkInTime:       activities[r.act].startTime,
        checkOutTime:      activities[r.act].endTime,
      },
    });
  }
  console.log("✓ registration_checkins (20)");

  // ══════════════════════════════════════════════════════════════
  // 13. TEAM_MEMBERS  (20 — 5 team registrations × 4 members)
  // ══════════════════════════════════════════════════════════════
  const teamMemberData = [
    // Hackathon — student1's team (Team Alpha)
    { regKey:"student1@test.com|Hackathon BK 2026",                          user:"student1@test.com", role:"leader" },
    { regKey:"student1@test.com|Hackathon BK 2026",                          user:"student2@test.com", role:"member" },
    { regKey:"student1@test.com|Hackathon BK 2026",                          user:"student3@test.com", role:"member" },
    { regKey:"student1@test.com|Hackathon BK 2026",                          user:"student4@test.com", role:"member" },
    // Football — student5's team (FC BK Stars)
    { regKey:"student5@test.com|Giải Bóng Đá Sinh Viên BK Cup 2026",         user:"student5@test.com", role:"captain" },
    { regKey:"student5@test.com|Giải Bóng Đá Sinh Viên BK Cup 2026",         user:"student6@test.com", role:"member" },
    { regKey:"student5@test.com|Giải Bóng Đá Sinh Viên BK Cup 2026",         user:"student7@test.com", role:"member" },
    { regKey:"student5@test.com|Giải Bóng Đá Sinh Viên BK Cup 2026",         user:"student8@test.com", role:"member" },
    // UX Hackathon — student2's team (Pixel Craft)
    { regKey:"student2@test.com|Design Challenge: UI/UX Hackathon BK 2026",  user:"student2@test.com", role:"leader" },
    { regKey:"student2@test.com|Design Challenge: UI/UX Hackathon BK 2026",  user:"student3@test.com", role:"member" },
    { regKey:"student2@test.com|Design Challenge: UI/UX Hackathon BK 2026",  user:"student4@test.com", role:"member" },
    { regKey:"student2@test.com|Design Challenge: UI/UX Hackathon BK 2026",  user:"student5@test.com", role:"member" },
    // BK Run — student6's team (Run Squad)
    { regKey:"student6@test.com|BK Run – Chạy Bộ Vì Cộng Đồng 2026",        user:"student6@test.com", role:"leader" },
    { regKey:"student6@test.com|BK Run – Chạy Bộ Vì Cộng Đồng 2026",        user:"student7@test.com", role:"member" },
    { regKey:"student6@test.com|BK Run – Chạy Bộ Vì Cộng Đồng 2026",        user:"student8@test.com", role:"member" },
    { regKey:"student6@test.com|BK Run – Chạy Bộ Vì Cộng Đồng 2026",        user:"student1@test.com", role:"member" },
    // Badminton — student3's team (Smash BK)
    { regKey:"student3@test.com|Giải Cầu Lông BK 2026",                      user:"student3@test.com", role:"leader" },
    { regKey:"student3@test.com|Giải Cầu Lông BK 2026",                      user:"student4@test.com", role:"member" },
    { regKey:"student3@test.com|Giải Cầu Lông BK 2026",                      user:"student5@test.com", role:"member" },
    { regKey:"student3@test.com|Giải Cầu Lông BK 2026",                      user:"student6@test.com", role:"member" },
  ];
  for (const tm of teamMemberData) {
    const reg = regs[tm.regKey];
    if (!reg) continue;
    await prisma.teamMember.upsert({
      where:  { registrationId_userId: { registrationId: reg.registrationId, userId: U(tm.user) } },
      update: {},
      create: { registrationId: reg.registrationId, userId: U(tm.user), role: tm.role },
    });
  }
  console.log("✓ team_members (20)");

  // ══════════════════════════════════════════════════════════════
  // 14. REVIEWS  (20 — one per registration)
  // ══════════════════════════════════════════════════════════════
  const reviewComments = [
    "Hoạt động rất hay, tổ chức chuyên nghiệp!",
    "Nội dung bổ ích, sẽ tham gia lần sau.",
    "Khá tốt, có thể cải thiện thêm về thời gian.",
    "Tuyệt vời! Học được rất nhiều kiến thức mới.",
    "Ổn, nhưng địa điểm hơi chật.",
    "Rất chuyên nghiệp và bổ ích.",
    "Hài lòng, ban tổ chức nhiệt tình.",
    "Nội dung hay nhưng hơi dài.",
    "Đáng tham gia, sẽ giới thiệu bạn bè.",
    "Tốt, nhưng cần cải thiện khâu đăng ký.",
    "Xuất sắc! Trải nghiệm tuyệt vời.",
    "Bình thường, không có gì nổi bật.",
    "Rất hào hứng khi tham gia.",
    "Tổ chức tốt, nội dung phong phú.",
    "OK, có thể làm tốt hơn ở lần sau.",
    "Trải nghiệm đáng nhớ!",
    "Giảng viên giỏi, nội dung sâu.",
    "Sự kiện tuyệt vời, rất đáng tham gia.",
    "Hài lòng 100%.",
    "Sẽ tham gia lần tới chắc chắn.",
  ];
  const ratings = [5,4,3,5,4,5,4,3,5,4,5,3,4,5,3,5,5,4,5,5];
  let rIdx = 0;
  for (const r of regData) {
    const reg = regs[`${r.user}|${r.act}`];
    if (!reg) continue;
    const exists = await prisma.review.findUnique({ where: { registrationId: reg.registrationId } });
    if (!exists) {
      await prisma.review.create({
        data: {
          registrationId: reg.registrationId,
          rating:         ratings[rIdx % ratings.length],
          comment:        reviewComments[rIdx % reviewComments.length],
          reviewTime:     new Date(),
          createdBy:      U(r.user),
        },
      });
    }
    rIdx++;
  }
  console.log("✓ reviews (20)");

  // ══════════════════════════════════════════════════════════════
  // 15. CLUB_APPLICATIONS  (20)
  // ══════════════════════════════════════════════════════════════
  const appData = [
    // CLB Tin Học (5)
    { user:"student1@test.com", act:"Tuyển thành viên CLB Tin Học BK – Khóa 2026",   result:"pending"   },
    { user:"student2@test.com", act:"Tuyển thành viên CLB Tin Học BK – Khóa 2026",   result:"interview" },
    { user:"student3@test.com", act:"Tuyển thành viên CLB Tin Học BK – Khóa 2026",   result:"accepted"  },
    { user:"student4@test.com", act:"Tuyển thành viên CLB Tin Học BK – Khóa 2026",   result:"rejected"  },
    { user:"student5@test.com", act:"Tuyển thành viên CLB Tin Học BK – Khóa 2026",   result:"pending"   },
    // CLB Tiếng Anh (4)
    { user:"student6@test.com", act:"Tuyển thành viên CLB Tiếng Anh BK – Khóa 2026", result:"accepted"  },
    { user:"student7@test.com", act:"Tuyển thành viên CLB Tiếng Anh BK – Khóa 2026", result:"interview" },
    { user:"student8@test.com", act:"Tuyển thành viên CLB Tiếng Anh BK – Khóa 2026", result:"pending"   },
    { user:"student1@test.com", act:"Tuyển thành viên CLB Tiếng Anh BK – Khóa 2026", result:"accepted"  },
    // CLB Thể Thao (4)
    { user:"student2@test.com", act:"Tuyển thành viên CLB Thể Thao BK 2026",          result:"accepted"  },
    { user:"student3@test.com", act:"Tuyển thành viên CLB Thể Thao BK 2026",          result:"pending"   },
    { user:"student4@test.com", act:"Tuyển thành viên CLB Thể Thao BK 2026",          result:"interview" },
    { user:"student5@test.com", act:"Tuyển thành viên CLB Thể Thao BK 2026",          result:"accepted"  },
    // CLB Âm Nhạc (3)
    { user:"student6@test.com", act:"Tuyển thành viên CLB Âm Nhạc BK 2026",           result:"interview" },
    { user:"student7@test.com", act:"Tuyển thành viên CLB Âm Nhạc BK 2026",           result:"accepted"  },
    { user:"student8@test.com", act:"Tuyển thành viên CLB Âm Nhạc BK 2026",           result:"pending"   },
    // CLB Thiết Kế (2)
    { user:"student1@test.com", act:"Tuyển thành viên CLB Thiết Kế BK 2026",          result:"accepted"  },
    { user:"student2@test.com", act:"Tuyển thành viên CLB Thiết Kế BK 2026",          result:"pending"   },
    // CLB Khoa Học (2)
    { user:"student3@test.com", act:"Tuyển thành viên CLB Khoa Học BK 2026",          result:"interview" },
    { user:"student4@test.com", act:"Tuyển thành viên CLB Khoa Học BK 2026",          result:"accepted"  },
  ];
  for (const a of appData) {
    try {
      await prisma.clubApplication.upsert({
        where:  { activityId_userId: { activityId: aId(a.act), userId: U(a.user) } },
        update: {},
        create: { activityId: aId(a.act), userId: U(a.user), result: a.result, submittedAt: new Date() },
      });
    } catch { /* skip duplicate */ }
  }
  console.log("✓ club_applications (20)");

  // ══════════════════════════════════════════════════════════════
  // 16. NOTIFICATIONS  (20)
  // ══════════════════════════════════════════════════════════════
  if (!(await skip("notification", {}))) {
    const notifData = [
      { user:"student1@test.com", title:"Đăng ký thành công",                   content:"Bạn đã đăng ký Hackathon BK 2026 thành công.",                    type:"registration", status:"unread" },
      { user:"student1@test.com", title:"Nhắc lịch sự kiện",                    content:"Hackathon BK 2026 sẽ diễn ra vào ngày 15/04/2026.",                type:"reminder",     status:"read"   },
      { user:"student2@test.com", title:"Đơn tuyển sinh được duyệt",            content:"Đơn tuyển CLB Thiết Kế BK của bạn đang ở bước Interview.",         type:"application",  status:"unread" },
      { user:"student2@test.com", title:"Đăng ký thành công",                   content:"Bạn đã đăng ký English Speaking Club – Tháng 4 thành công.",      type:"registration", status:"read"   },
      { user:"student3@test.com", title:"Kết quả tuyển sinh",                   content:"Chúc mừng! Bạn đã được nhận vào CLB Tin Học BK.",                  type:"application",  status:"unread" },
      { user:"student3@test.com", title:"Đăng ký được chấp thuận",             content:"Đăng ký Workshop AI & ML của bạn đã được duyệt.",                  type:"registration", status:"read"   },
      { user:"student4@test.com", title:"Nhắc nộp hồ sơ",                      content:"Deadline nộp hồ sơ CLB Thể Thao BK là ngày 08/04/2026.",            type:"reminder",     status:"unread" },
      { user:"student4@test.com", title:"Đăng ký thành công",                   content:"Bạn đã đăng ký English Speaking Club – Tháng 4 thành công.",      type:"registration", status:"unread" },
      { user:"student5@test.com", title:"Mời tham gia đội bóng",               content:"Bạn được mời tham gia đội FC BK Stars.",                            type:"team",         status:"unread" },
      { user:"student5@test.com", title:"Sự kiện sắp diễn ra",                 content:"BK Run 2026 sẽ diễn ra vào 25/04/2026. Hãy chuẩn bị sẵn sàng!",   type:"reminder",     status:"read"   },
      { user:"student6@test.com", title:"Đăng ký thành công",                   content:"Bạn đã đăng ký IELTS Study Group thành công.",                     type:"registration", status:"unread" },
      { user:"student6@test.com", title:"Thông báo từ CLB Tiếng Anh BK",       content:"Buổi sinh hoạt tiếng Anh tháng 4 sẽ diễn ra vào 12/04/2026.",      type:"announcement", status:"read"   },
      { user:"student7@test.com", title:"Kết quả hùng biện",                   content:"Bạn đã lọt vào vòng bán kết Cuộc thi Hùng biện Tiếng Anh 2026.",  type:"result",       status:"unread" },
      { user:"student7@test.com", title:"Đăng ký được chấp thuận",             content:"Đăng ký Workshop Figma của bạn đã được xác nhận.",                 type:"registration", status:"read"   },
      { user:"student8@test.com", title:"Nhắc lịch sự kiện",                   content:"Ngày hội Văn hóa Quốc tế BK 2026 sẽ diễn ra vào 20/05/2026.",     type:"reminder",     status:"unread" },
      { user:"student8@test.com", title:"Thông báo hệ thống",                  content:"Hồ sơ tuyển sinh CLB Âm Nhạc BK đang được xem xét.",               type:"system",       status:"read"   },
      { user:"leader1@test.com",  title:"Có đơn đăng ký mới",                  content:"5 sinh viên vừa đăng ký Hackathon BK 2026.",                        type:"admin",        status:"unread" },
      { user:"leader2@test.com",  title:"Có đơn tuyển sinh mới",               content:"3 sinh viên mới nộp đơn tuyển CLB Tiếng Anh BK.",                   type:"admin",        status:"unread" },
      { user:"leader3@test.com",  title:"Nhắc cập nhật danh sách đội",         content:"Giải BK Cup 2026 sẽ bắt đầu sau 1 tuần. Hãy xác nhận đội hình.",   type:"reminder",     status:"unread" },
      { user:"admin@test.com",    title:"Báo cáo hệ thống",                    content:"Tổng số đăng ký trong tuần: 47. Hoạt động hệ thống bình thường.",   type:"system",       status:"read"   },
    ];
    await prisma.notification.createMany({
      data: notifData.map(n => ({
        userId:           U(n.user),
        title:            n.title,
        content:          n.content,
        notificationType: n.type,
        status:           n.status,
        createdBy:        U("admin@test.com"),
      })),
    });
  }
  console.log("✓ notifications (20)");

  // ══════════════════════════════════════════════════════════════
  // 17. SYSTEM_LOGS  (20)
  // ══════════════════════════════════════════════════════════════
  if (!(await skip("systemLog", {}))) {
    const logData = [
      { user:"admin@test.com",    action:"CREATE_ORGANIZATION", old:null,                              new:'{"name":"CLB Tin Học BK"}' },
      { user:"admin@test.com",    action:"CREATE_ORGANIZATION", old:null,                              new:'{"name":"CLB Tiếng Anh BK"}' },
      { user:"admin@test.com",    action:"CREATE_USER",         old:null,                              new:'{"email":"leader1@test.com"}' },
      { user:"admin@test.com",    action:"CREATE_USER",         old:null,                              new:'{"email":"student1@test.com"}' },
      { user:"leader1@test.com",  action:"CREATE_ACTIVITY",     old:null,                              new:'{"name":"Hackathon BK 2026"}' },
      { user:"leader1@test.com",  action:"CREATE_ACTIVITY",     old:null,                              new:'{"name":"Workshop AI ML"}' },
      { user:"leader2@test.com",  action:"CREATE_ACTIVITY",     old:null,                              new:'{"name":"English Speaking Club"}' },
      { user:"leader2@test.com",  action:"UPDATE_ACTIVITY",     old:'{"status":"draft"}',              new:'{"status":"published"}' },
      { user:"leader3@test.com",  action:"CREATE_ACTIVITY",     old:null,                              new:'{"name":"BK Cup 2026"}' },
      { user:"leader3@test.com",  action:"UPDATE_ACTIVITY",     old:'{"maxParticipants":100}',         new:'{"maxParticipants":160}' },
      { user:"student1@test.com", action:"REGISTER_ACTIVITY",   old:null,                              new:'{"activity":"Hackathon BK 2026","status":"pending"}' },
      { user:"student1@test.com", action:"REGISTER_ACTIVITY",   old:null,                              new:'{"activity":"English Speaking Club","status":"pending"}' },
      { user:"student2@test.com", action:"REGISTER_ACTIVITY",   old:null,                              new:'{"activity":"Hackathon BK 2026","status":"pending"}' },
      { user:"student3@test.com", action:"SUBMIT_APPLICATION",  old:null,                              new:'{"club":"CLB Tin Học BK","result":"pending"}' },
      { user:"leader1@test.com",  action:"APPROVE_REGISTRATION",old:'{"status":"pending"}',            new:'{"status":"approved"}' },
      { user:"leader1@test.com",  action:"UPDATE_APPLICATION",  old:'{"result":"pending"}',            new:'{"result":"interview"}' },
      { user:"admin@test.com",    action:"UPDATE_ORGANIZATION",  old:'{"type":"club"}',                 new:'{"type":"university","name":"Đoàn Thanh Niên BK"}' },
      { user:"admin@test.com",    action:"DELETE_USER",          old:'{"email":"temp@test.com"}',       new:null },
      { user:"leader4@test.com",  action:"CREATE_ACTIVITY",     old:null,                              new:'{"name":"Spring Concert 2026"}' },
      { user:"leader5@test.com",  action:"CREATE_ACTIVITY",     old:null,                              new:'{"name":"UI/UX Hackathon 2026"}' },
    ];
    await prisma.systemLog.createMany({
      data: logData.map(l => ({
        userId:        U(l.user),
        action:        l.action,
        oldData:       l.old,
        newData:       l.new,
        executionTime: new Date(),
        createdBy:     U(l.user),
      })),
    });
  }
  console.log("✓ system_logs (20)");

  console.log("\n═══════════════════════════════════════════");
  console.log("Seed hoàn tất!");
  console.log("═══════════════════════════════════════════");
  console.log("  admin@test.com    / Admin@123");
  console.log("  leader1@test.com  / Leader@123   (CLB Tin Học BK)");
  console.log("  leader2@test.com  / Leader@123   (CLB Tiếng Anh BK)");
  console.log("  student1@test.com / Student@123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
