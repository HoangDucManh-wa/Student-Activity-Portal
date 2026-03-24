/**
 * Seed script — inserts test data for all roles.
 *
 * Accounts created:
 *   admin@test.com          / Admin@123      — role: admin
 *   leader@test.com         / Leader@123     — role: organization_leader
 *   member@test.com         / Member@123     — role: organization_member
 *   student@test.com        / Student@123    — role: student
 *
 * Also creates:
 *   - 1 organization (Tech Club)
 *   - 1 activity
 *   - 1 open form with 3 questions
 *
 * Run: node environment/database/seed.js
 */

require("dotenv").config({ path: "./.env" });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── 1. Roles ────────────────────────────────────────────────────────────────
  const roleCodes = ["admin", "student", "organization_leader", "organization_member"];
  const roles = {};

  for (const code of roleCodes) {
    const role = await prisma.role.upsert({
      where: { code },
      update: {},
      create: { code, roleName: code.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) },
    });
    roles[code] = role;
    console.log(`  Role: ${code} (id=${role.roleId})`);
  }

  // ── 2. Users ─────────────────────────────────────────────────────────────────
  const usersData = [
    { userName: "Admin User",            email: "admin@test.com",   password: "Admin@123",   role: "admin",                university: "Test University" },
    { userName: "Organization Leader",   email: "leader@test.com",  password: "Leader@123",  role: "organization_leader", university: "Test University" },
    { userName: "Organization Member",   email: "member@test.com",  password: "Member@123",  role: "organization_member", university: "Test University" },
    { userName: "Student User",          email: "student@test.com", password: "Student@123", role: "student",             university: "Test University" },
  ];

  const users = {};

  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.password, 12);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        userName:   u.userName,
        email:      u.email,
        password:   hashed,
        university: u.university,
        status:     "active",
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.userId, roleId: roles[u.role].roleId } },
      update: {},
      create: { userId: user.userId, roleId: roles[u.role].roleId },
    });

    users[u.role] = user;
    console.log(`  User: ${u.email} (id=${user.userId}, role=${u.role})`);
  }

  // ── 3. Organization ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where:  { organizationId: 1 },
    update: {},
    create: {
      organizationName: "Tech Club",
      organizationType: "club",
      description:      "A club for tech enthusiasts.",
      createdBy:        users["admin"].userId,
    },
  });
  console.log(`  Organization: ${org.organizationName} (id=${org.organizationId})`);

  // Add leader and member to organization
  await prisma.organizationMember.upsert({
    where:  { userId_organizationId: { userId: users["organization_leader"].userId, organizationId: org.organizationId } },
    update: {},
    create: { userId: users["organization_leader"].userId, organizationId: org.organizationId, role: "leader" },
  });

  await prisma.organizationMember.upsert({
    where:  { userId_organizationId: { userId: users["organization_member"].userId, organizationId: org.organizationId } },
    update: {},
    create: { userId: users["organization_member"].userId, organizationId: org.organizationId, role: "member" },
  });

  // ── 4. Activity Categories ───────────────────────────────────────────────────
  const categoryNames = ["Học thuật", "Phi học thuật"]
  for (const categoryName of categoryNames) {
    const cat = await prisma.activityCategory.upsert({
      where: { categoryName },
      update: {},
      create: { categoryName },
    })
    console.log(`  Category: ${cat.categoryName} (id=${cat.categoryId})`)
  }

  // ── 5. Activity ──────────────────────────────────────────────────────────────
  const existingActivity = await prisma.activity.findFirst({ where: { activityName: "Tech Hackathon 2026" } });
  let activity;
  if (!existingActivity) {
    activity = await prisma.activity.create({
      data: {
        activityName:   "Tech Hackathon 2026",
        location:       "Main Hall, Building A",
        type:           "competition",
        description:    "Annual hackathon for students. Build something amazing in 24 hours.",
        startTime:      new Date("2026-04-01T08:00:00Z"),
        endTime:        new Date("2026-04-02T08:00:00Z"),
        maxParticipants: 100,
        approvalStatus: "approved",
        organizationId: org.organizationId,
        createdBy:      users["organization_leader"].userId,
      },
    });
    console.log(`  Activity: ${activity.activityName} (id=${activity.activityId})`);
  } else {
    activity = existingActivity;
    console.log(`  Activity: already exists (id=${activity.activityId})`);
  }

  // ── 6. Open Form ─────────────────────────────────────────────────────────────
  const existingForm = await prisma.form.findFirst({ where: { title: "Hackathon Registration Form" } });
  if (!existingForm) {
    const form = await prisma.form.create({
      data: {
        title:             "Hackathon Registration Form",
        description:       "Register for Tech Hackathon 2026",
        status:            "open",
        collectEmail:      true,
        limitOneResponse:  false,
        allowEditResponse: false,
        requireSignIn:     true,
        activityId:        activity.activityId,
        createdBy:         users["organization_leader"].userId,
        sections: {
          create: [
            {
              title: "Personal Information",
              order: 0,
              navigationType: "next",
              questions: {
                create: [
                  {
                    title:    "Full Name",
                    type:     "short_text",
                    order:    0,
                    required: true,
                  },
                  {
                    title:    "Student ID",
                    type:     "short_text",
                    order:    1,
                    required: true,
                  },
                  {
                    title:    "Which track are you interested in?",
                    type:     "multiple_choice",
                    order:    2,
                    required: true,
                    options: {
                      create: [
                        { label: "Web Development",   order: 0 },
                        { label: "Mobile App",        order: 1 },
                        { label: "AI / Machine Learning", order: 2 },
                        { label: "Cybersecurity",     order: 3 },
                      ],
                    },
                  },
                  {
                    title:    "Tell us about yourself",
                    type:     "paragraph",
                    order:    3,
                    required: false,
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`  Form: ${form.title} (id=${form.formId})`);
  } else {
    console.log(`  Form: already exists (id=${existingForm.formId})`);
  }

  // ── 7. Permissions ───────────────────────────────────────────────────────────
  const permissions = [
    { code: "users:read",          name: "Read Users",         resource: "users",          action: "read" },
    { code: "users:write",         name: "Write Users",        resource: "users",          action: "write" },
    { code: "activities:read",     name: "Read Activities",    resource: "activities",     action: "read" },
    { code: "activities:write",    name: "Write Activities",   resource: "activities",     action: "write" },
    { code: "forms:read",          name: "Read Forms",         resource: "forms",          action: "read" },
    { code: "forms:write",         name: "Write Forms",        resource: "forms",          action: "write" },
    { code: "notifications:send",  name: "Send Notifications", resource: "notifications",  action: "send" },
  ];

  for (const p of permissions) {
    const perm = await prisma.permission.upsert({
      where:  { code: p.code },
      update: {},
      create: p,
    });

    // Assign all permissions to admin role
    await prisma.rolePermission.upsert({
      where:  { roleId_permissionId: { roleId: roles["admin"].roleId, permissionId: perm.permissionId } },
      update: {},
      create: { roleId: roles["admin"].roleId, permissionId: perm.permissionId },
    });
  }
  console.log(`  Permissions: ${permissions.length} created and assigned to admin`);

  // ── 8. System Config — Student allowed email domains ─────────────────────────
  const existingDomainConfig = await prisma.systemConfig.findFirst({
    where: { key: "student.allowed_email_domains", organizationId: null, isDeleted: false },
  });
  if (!existingDomainConfig) {
    await prisma.systemConfig.create({
      data: {
        key: "student.allowed_email_domains",
        value: {
          domains: [
            "edu.vn",
            "ac.vn",
            "hust.edu.vn",
            "uet.vnu.edu.vn",
            "hus.edu.vn",
            "neu.edu.vn",
            "vnu.edu.vn",
            "ptit.edu.vn",
            "huce.edu.vn",
            "uit.edu.vn",
            "hcmut.edu.vn",
          ],
        },
        dataType: "json",
        category: "student",
        label: "Allowed Student Email Domains",
        description: "Danh sách các đuôi email được coi là email sinh viên. Hỗ trợ suffix matching (vd: edu.vn khớp với @hust.edu.vn).",
        organizationId: null,
        createdBy: null,
      },
    });
  }
  console.log("  SystemConfig: student.allowed_email_domains seeded");

  const existingBannerConfig = await prisma.systemConfig.findFirst({
    where: { key: "homepage.banner_slides", organizationId: null, isDeleted: false },
  });
  if (!existingBannerConfig) {
    await prisma.systemConfig.create({
      data: {
        key: "homepage.banner_slides",
        value: {
          slides: [
            { imageUrl: "/slide.png", linkUrl: null, alt: "Banner 1" },
            { imageUrl: "/slide.png", linkUrl: null, alt: "Banner 2" },
            { imageUrl: "/slide.png", linkUrl: null, alt: "Banner 3" },
          ],
        },
        dataType: "json",
        category: "homepage",
        label: "Banner Slider",
        description: "Danh sách ảnh banner hiển thị trên trang chủ. Mỗi slide có imageUrl, linkUrl (tuỳ chọn) và alt text.",
        organizationId: null,
        createdBy: null,
      },
    });
  }
  console.log("  SystemConfig: homepage.banner_slides seeded");

  // ── 9. System Config — Registration auto-approve ────────────────────────────
  const existingAutoApproveConfig = await prisma.systemConfig.findFirst({
    where: { key: "registration.auto_approve", organizationId: null, isDeleted: false },
  });
  if (!existingAutoApproveConfig) {
    await prisma.systemConfig.create({
      data: {
        key:         "registration.auto_approve",
        value:        { enabled: false },
        dataType:     "json",
        category:     "registration",
        label:        "Auto Approve Registration",
        description:  "Tự động duyệt đăng ký hoạt động cho sinh viên mà không cần xét duyệt thủ công.",
        organizationId: null,
        createdBy:    null,
      },
    });
  }
  console.log("  SystemConfig: registration.auto_approve seeded");

  console.log("\nSeed complete.");
  console.log("\nTest accounts:");
  console.log("  admin@test.com          / Admin@123    (admin)");
  console.log("  leader@test.com         / Leader@123   (organization_leader)");
  console.log("  member@test.com         / Member@123   (organization_member)");
  console.log("  student@test.com        / Student@123  (student)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
