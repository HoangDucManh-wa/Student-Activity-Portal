const bcrypt = require("bcryptjs");

const prisma = require("../../config/prisma");
const { redis } = require("../../config/redis");
const AppError = require("../../utils/app-error");
const { USER_STATUS, CONFIG_KEYS, REDIS_PREFIX } = require("../../utils/constants");
const { resolveFields, resolveArrayFields } = require("../../utils/s3-helpers");
const { getConfig } = require("../system-config/system-config.service");
const { isStudentEmailSync } = require("../../utils/student-email");

const invalidateUserSession = async (userId) => {
  await redis.del(`${REDIS_PREFIX.USER_SESSION}${userId}`);
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const getOverviewStats = async () => {
  const [totalUsers, activeUsers, totalActivities, totalOrganizations, totalRegistrations] =
    await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { isDeleted: false, status: USER_STATUS.ACTIVE } }),
      prisma.activity.count({ where: { isDeleted: false } }),
      prisma.organization.count({ where: { isDeleted: false } }),
      prisma.registration.count({ where: { isDeleted: false } }),
    ]);

  return { totalUsers, activeUsers, totalActivities, totalOrganizations, totalRegistrations };
};

const getActivityStats = async () => {
  const [byStatus, byType] = await Promise.all([
    prisma.activity.groupBy({
      by: ["activityStatus"],
      where: { isDeleted: false },
      _count: { activityId: true },
    }),
    prisma.activity.groupBy({
      by: ["activityType"],
      where: { isDeleted: false },
      _count: { activityId: true },
    }),
  ]);

  return {
    byStatus: byStatus.map((s) => ({ status: s.activityStatus, count: s._count.activityId })),
    byType: byType.map((t) => ({ type: t.activityType, count: t._count.activityId })),
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const assignRole = async (userId, roleCode) => {
  const role = await prisma.role.findUnique({ where: { code: roleCode } });
  if (!role) throw new AppError("VALIDATION_ERROR", `Role '${roleCode}' does not exist`);

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.roleId } },
    update: { isDeleted: false },
    create: { userId, roleId: role.roleId },
  });

  return role.code;
};

// ─── Create single user ───────────────────────────────────────────────────────

const createUser = async (
  { userName, email, password, university, faculty, className, studentId, phoneNumber, role = "student" },
  createdBy
) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("AUTH_EMAIL_EXISTS");

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      userName,
      email,
      password: hashed,
      university,
      faculty: faculty || null,
      className: className || null,
      studentId: studentId || null,
      phoneNumber: phoneNumber || null,
      status: USER_STATUS.ACTIVE,
      createdBy,
    },
    select: {
      userId: true,
      userName: true,
      email: true,
      university: true,
      faculty: true,
      className: true,
      studentId: true,
      phoneNumber: true,
      status: true,
    },
  });

  const assignedRole = await assignRole(user.userId, role);

  return { ...user, role: assignedRole };
};

// ─── CSV import ───────────────────────────────────────────────────────────────

const parseCSV = (csvText, requiredColumns = []) => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new AppError("VALIDATION_ERROR", "CSV must have a header row and at least one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const missing = requiredColumns.filter((col) => !headers.includes(col));
  if (missing.length > 0) {
    throw new AppError("VALIDATION_ERROR", `Missing required columns: ${missing.join(", ")}`);
  }

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line, idx) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row = Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
      row._rowNum = idx + 2;
      return row;
    });
};

const importUsersFromCSV = async (csvText, createdBy) => {
  const rows = parseCSV(csvText, ["userName", "email", "password", "university"]);
  const results = { created: [], failed: [] };

  for (const row of rows) {
    const { _rowNum, ...data } = row;
    try {
      if (!data.userName || !data.email || !data.password || !data.university) {
        throw new Error("Missing required fields: userName, email, password, university");
      }
      const user = await createUser(
        {
          userName: data.userName,
          email: data.email,
          password: data.password,
          university: data.university,
          faculty: data.faculty || undefined,
          className: data.className || undefined,
          studentId: data.studentId || undefined,
          phoneNumber: data.phoneNumber || undefined,
          role: data.role || "student",
        },
        createdBy
      );
      results.created.push(user);
    } catch (err) {
      results.failed.push({ row: _rowNum, email: data.email, reason: err.message });
    }
  }

  return {
    total: rows.length,
    created: results.created.length,
    failed: results.failed.length,
    createdUsers: results.created,
    errors: results.failed,
  };
};

// ─── Monthly registration trend (last N months) ───────────────────────────

const getRegistrationTrend = async (months = 6) => {
  const rows = await prisma.$queryRaw`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "registrationTime"), 'YYYY-MM') AS month,
      COUNT(*)::int AS total
    FROM registrations
    WHERE "isDeleted" = false
      AND "registrationTime" >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' * ${months - 1}
    GROUP BY DATE_TRUNC('month', "registrationTime")
    ORDER BY DATE_TRUNC('month', "registrationTime")
  `;

  return rows.map((r) => ({ month: r.month, total: r.total }));
};

// ─── Create single organization (+ auto-create leader account) ────────────────

const createOrganization = async (
  { organizationName, organizationType, email, description,
    leaderName, leaderEmail, leaderPassword, leaderUniversity, leaderPhoneNumber },
  createdBy
) => {
  // Check if leader email already exists
  const existingUser = await prisma.user.findUnique({ where: { email: leaderEmail } });
  if (existingUser) throw new AppError("AUTH_EMAIL_EXISTS", `Email '${leaderEmail}' đã tồn tại`);

  const hashedPassword = await bcrypt.hash(leaderPassword, 12);

  const roleCode = "organization_leader";

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create the organization
    const org = await tx.organization.create({
      data: {
        organizationName,
        organizationType,
        email: email || null,
        description: description || null,
        createdBy,
      },
      select: {
        organizationId: true,
        organizationName: true,
        organizationType: true,
        email: true,
        description: true,
      },
    });

    // 2. Create the leader user account
    const user = await tx.user.create({
      data: {
        userName: leaderName,
        email: leaderEmail,
        password: hashedPassword,
        university: leaderUniversity,
        phoneNumber: leaderPhoneNumber || null,
        status: USER_STATUS.ACTIVE,
        createdBy,
      },
      select: {
        userId: true,
        userName: true,
        email: true,
        university: true,
      },
    });

    // 3. Assign role
    const role = await tx.role.findUnique({ where: { code: roleCode } });
    if (role) {
      await tx.userRole.create({
        data: { userId: user.userId, roleId: role.roleId },
      });
    }

    // 4. Link user as president of the organization
    await tx.organizationMember.create({
      data: {
        userId: user.userId,
        organizationId: org.organizationId,
        role: "president",
        joinDate: new Date(),
        createdBy,
      },
    });

    return { organization: org, leader: { ...user, role: roleCode } };
  });

  return result;
};

// ─── CSV import organizations ──────────────────────────────────────────────────

const importOrgsFromCSV = async (csvText, createdBy) => {
  const rows = parseCSV(csvText, ["organizationName", "organizationType", "leaderName", "leaderEmail", "leaderPassword", "leaderUniversity"]);
  const results = { created: [], failed: [] };

  for (const row of rows) {
    const { _rowNum, ...data } = row;
    try {
      const result = await createOrganization(
        {
          organizationName: data.organizationName,
          organizationType: data.organizationType,
          email: data.email || undefined,
          description: data.description || undefined,
          leaderName: data.leaderName,
          leaderEmail: data.leaderEmail,
          leaderPassword: data.leaderPassword,
          leaderUniversity: data.leaderUniversity,
          leaderPhoneNumber: data.leaderPhoneNumber || undefined,
        },
        createdBy
      );
      results.created.push(result);
    } catch (err) {
      results.failed.push({ row: _rowNum, organizationName: data.organizationName, reason: err.message });
    }
  }

  return {
    total: rows.length,
    created: results.created.length,
    failed: results.failed.length,
    createdOrganizations: results.created,
    errors: results.failed,
  };
};

// ─── List users (admin) ────────────────────────────────────────────────────────
// type: "student" | "club" | "third_party" — map tới role/org type

const listUsers = async ({ page = 1, limit = 20, search, status, type, emailType, university } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  // Fetch allowed student email domains once (cached via Redis)
  const domainConfig = await getConfig(CONFIG_KEYS.STUDENT_ALLOWED_DOMAINS);
  const allowedDomains = domainConfig?.domains ?? [];

  // Build domain filter conditions for Prisma
  // Each domain `d` matches: user@d (exact) OR user@sub.d (subdomain)
  const buildDomainConditions = (domains) =>
    domains.flatMap((d) => [
      { email: { endsWith: `@${d}` } },
      { email: { endsWith: `.${d}` } },
    ]);

  let emailFilter = null;
  if (emailType && allowedDomains.length > 0) {
    const domainConditions = buildDomainConditions(allowedDomains);
    if (emailType === "student") {
      emailFilter = { OR: domainConditions };
    } else if (emailType === "external") {
      emailFilter = { NOT: { OR: domainConditions } };
    }
  }

  // Use AND array to safely combine OR-based filters without key collision
  const andConditions = [
    { isDeleted: false },
    ...(status ? [{ status }] : []),
    ...(emailFilter ? [emailFilter] : []),
    ...(university ? [{ university: { contains: university, mode: "insensitive" } }] : []),
    ...(search
      ? [{ OR: [
          { userName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } },
        ] }]
      : []),
  ];

  const where = { AND: andConditions };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        userId: true,
        userName: true,
        email: true,
        studentId: true,
        university: true,
        phoneNumber: true,
        status: true,
        avatarUrl: true,
        createdAt: true,
        userRoles: {
          where: { isDeleted: false },
          select: { role: { select: { code: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: data.map(({ userRoles, ...u }) => ({
      ...u,
      roles: userRoles.map((ur) => ur.role?.code).filter(Boolean),
      isStudentEmail: isStudentEmailSync(u.email, allowedDomains),
    })),
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── List users grouped by university ────────────────────────────────────────

const listUsersByUniversity = async ({ page = 1, limit = 20, search, status, university } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const domainConfig = await getConfig(CONFIG_KEYS.STUDENT_ALLOWED_DOMAINS);
  const allowedDomains = domainConfig?.domains ?? [];

  // Base conditions shared by both queries
  const baseConditions = [
    { isDeleted: false },
    ...(status ? [{ status }] : []),
    ...(university ? [{ university: { contains: university, mode: "insensitive" } }] : []),
    ...(search
      ? [{ OR: [
          { userName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } },
        ] }]
      : []),
  ];

  const where = { AND: baseConditions };

  // Unique universities with counts (case-insensitive via $queryRaw)
  const [universityAgg, totalCountResult] = await Promise.all([
    prisma.$queryRaw`
      SELECT TRIM(UPPER("university")) AS normalized_university,
             "university"              AS original_name,
             COUNT(*)::int             AS total
      FROM users
      WHERE "isDeleted" = false
        AND "university" IS NOT NULL
        ${university ? prisma.$queryRaw`AND LOWER("university") LIKE LOWER(${`%${university}%`})` : prisma.$queryRaw``}
      GROUP BY TRIM(UPPER("university")), "university"
      ORDER BY total DESC
      OFFSET ${(pageNum - 1) * limitNum}
      LIMIT ${limitNum}
    `,
    prisma.$queryRaw`
      SELECT COUNT(DISTINCT TRIM(UPPER("university")))::int AS total
      FROM users
      WHERE "isDeleted" = false
        AND "university" IS NOT NULL
        ${university ? prisma.$queryRaw`AND LOWER("university") LIKE LOWER(${`%${university}%`})` : prisma.$queryRaw``}
    `,
  ]);

  const total = Number(totalCountResult[0]?.total ?? 0);

  const universities = universityAgg.map((u) => ({
    university: u.original_name,
    totalStudents: Number(u.total),
  }));

  // Fetch student list per university (top 5 preview each)
  const previewLimit = 5;
  const universitiesWithPreview = await Promise.all(
    universities.map(async (u) => {
      const students = await prisma.user.findMany({
        where: { ...where, university: u.university },
        select: {
          userId: true, userName: true, email: true, studentId: true,
          university: true, phoneNumber: true, status: true, avatarUrl: true,
          userRoles: {
            where: { isDeleted: false },
            select: { role: { select: { code: true } } },
          },
        },
        take: previewLimit,
        orderBy: { createdAt: "desc" },
      });

      return {
        ...u,
        students: students.map(({ userRoles, ...s }) => ({
          ...s,
          roles: userRoles.map((ur) => ur.role?.code).filter(Boolean),
          isStudentEmail: isStudentEmailSync(s.email, allowedDomains),
        })),
      };
    })
  );

  return {
    data: universitiesWithPreview,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Update user (admin) ───────────────────────────────────────────────────────

const adminUpdateUser = async (userId, data, updatedBy) => {
  const user = await prisma.user.findFirst({ where: { userId: Number(userId), isDeleted: false } });
  if (!user) throw new AppError("USER_NOT_FOUND");

  const { password, ...updateData } = data;
  const payload = { ...updateData, updatedBy: Number(updatedBy), updatedAt: new Date() };

  if (password) {
    payload.password = await bcrypt.hash(password, 12);
  }

  return prisma.user.update({
    where: { userId: Number(userId) },
    data: payload,
    select: {
      userId: true, userName: true, email: true, studentId: true,
      university: true, phoneNumber: true, status: true, avatarUrl: true,
    },
  });
};

// ─── Delete user (admin) ───────────────────────────────────────────────────────

const adminDeleteUser = async (userId, deletedBy) => {
  const user = await prisma.user.findFirst({ where: { userId: Number(userId), isDeleted: false } });
  if (!user) throw new AppError("USER_NOT_FOUND");

  return prisma.user.update({
    where: { userId: Number(userId) },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy: Number(deletedBy) },
  });
};

// ─── Lock / unlock user (admin) ───────────────────────────────────────────────

const adminToggleUserStatus = async (userId, status, updatedBy) => {
  const user = await prisma.user.findFirst({ where: { userId: Number(userId), isDeleted: false } });
  if (!user) throw new AppError("USER_NOT_FOUND");

  return prisma.user.update({
    where: { userId: Number(userId) },
    data: { status, updatedBy: Number(updatedBy), updatedAt: new Date() },
    select: {
      userId: true, userName: true, email: true, status: true,
    },
  });
};

// ─── List organizations (admin) ────────────────────────────────────────────────

const listOrganizations = async ({ page = 1, limit = 20, search, organizationType, status } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const where = {
    isDeleted: false,
    ...(organizationType && { organizationType }),
    ...(status && { status }),
    ...(search && { organizationName: { contains: search, mode: "insensitive" } }),
  };

  const [data, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      select: {
        organizationId: true, organizationName: true, organizationType: true,
        email: true, status: true, logoUrl: true, description: true, createdAt: true,
        _count: { select: { organizationMembers: { where: { isDeleted: false } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.organization.count({ where }),
  ]);

  await resolveArrayFields(data, ["logoUrl"]);

  return {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Update organization (admin) ──────────────────────────────────────────────

const adminUpdateOrganization = async (orgId, data, updatedBy) => {
  const org = await prisma.organization.findFirst({ where: { organizationId: Number(orgId), isDeleted: false } });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  const { password, ...updateData } = data;
  const payload = { ...updateData, updatedBy: Number(updatedBy), updatedAt: new Date() };

  if (password) {
    payload.password = await bcrypt.hash(password, 12);
  }

  const updatedOrg = await prisma.organization.update({
    where: { organizationId: Number(orgId) },
    data: payload,
    select: {
      organizationId: true, organizationName: true, organizationType: true,
      email: true, status: true, logoUrl: true, description: true,
    },
  });

  await resolveFields(updatedOrg, ["logoUrl"]);
  return updatedOrg;
};

// ─── Delete organization (admin) ──────────────────────────────────────────────

const adminDeleteOrganization = async (orgId, deletedBy) => {
  const org = await prisma.organization.findFirst({ where: { organizationId: Number(orgId), isDeleted: false } });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  return prisma.organization.update({
    where: { organizationId: Number(orgId) },
    data: { isDeleted: true, deletedAt: new Date(), deletedBy: Number(deletedBy) },
  });
};

// ─── Lock / unlock organization (admin) ───────────────────────────────────────

const adminToggleOrgStatus = async (orgId, status, updatedBy) => {
  const org = await prisma.organization.findFirst({ where: { organizationId: Number(orgId), isDeleted: false } });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  return prisma.organization.update({
    where: { organizationId: Number(orgId) },
    data: { status, updatedBy: Number(updatedBy), updatedAt: new Date() },
    select: { organizationId: true, organizationName: true, status: true },
  });
};

// ─── Reset user password (admin) ───────────────────────────────────────────────

const adminResetUserPassword = async (userId, newPassword, resetBy) => {
  const user = await prisma.user.findFirst({ where: { userId: Number(userId), isDeleted: false } });
  if (!user) throw new AppError("USER_NOT_FOUND");

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { userId: Number(userId) },
    data: { password: hashed, updatedBy: Number(resetBy), updatedAt: new Date() },
  });

  await invalidateUserSession(Number(userId));

  return { userId: Number(userId), email: user.email };
};

// ─── Reset organization password (admin) ──────────────────────────────────────
// Org leader logs in with their USER account via /auth/login (role=organization_leader).
// So we find and reset the leader's user password, not the organization.password field.

const adminResetOrgPassword = async (orgId, newPassword, resetBy) => {
  const org = await prisma.organization.findFirst({ where: { organizationId: Number(orgId), isDeleted: false } });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");

  const leaderMember = await prisma.organizationMember.findFirst({
    where: {
      organizationId: Number(orgId),
      role: "president",
      isDeleted: false,
    },
    include: { user: { select: { userId: true, email: true } } },
  });

  if (!leaderMember?.user) {
    throw new AppError("VALIDATION_ERROR", "Không tìm thấy tài khoản quản lý của tổ chức này");
  }

  const { user } = leaderMember;
  const hashed = await bcrypt.hash(newPassword, 12);
  console.log(`[AdminResetOrgPwd] orgId=${orgId} userId=${user.userId} email=${user.email} resetBy=${resetBy}`);

  await prisma.user.update({
    where: { userId: user.userId },
    data: { password: hashed, updatedBy: Number(resetBy), updatedAt: new Date() },
  });

  await invalidateUserSession(user.userId);

  return { organizationId: Number(orgId), userId: user.userId, email: user.email };
};

// ─── Account recovery: find user by name/phone/studentId ────────────────────────

const recoverUserAccount = async ({ userName, phoneNumber, studentId }) => {
  if (!userName && !phoneNumber && !studentId) {
    throw new AppError("VALIDATION_ERROR", "Cần ít nhất 1 thông tin: tên, SĐT hoặc mã sinh viên");
  }

  const users = await prisma.user.findMany({
    where: {
      isDeleted: false,
      ...(userName ? { userName: { contains: userName, mode: "insensitive" } } : {}),
      ...(phoneNumber ? { phoneNumber: { contains: phoneNumber, mode: "insensitive" } } : {}),
      ...(studentId ? { studentId: { contains: studentId, mode: "insensitive" } } : {}),
    },
    select: {
      userId: true,
      userName: true,
      email: true,
      studentId: true,
      phoneNumber: true,
      university: true,
      status: true,
      avatarUrl: true,
      userRoles: {
        where: { isDeleted: false },
        select: { role: { select: { code: true } } },
      },
    },
    take: 10,
  });

  return users.map(({ userRoles, ...u }) => ({
    ...u,
    roles: userRoles.map((ur) => ur.role?.code).filter(Boolean),
  }));
};

// ─── Resend password reset email for user ──────────────────────────────────────

const resendResetEmail = async (userId) => {
  const user = await prisma.user.findFirst({ where: { userId: Number(userId), isDeleted: false } });
  if (!user) throw new AppError("USER_NOT_FOUND");

  const { forgotPassword } = require("../auth/auth.service");
  await forgotPassword(user.email);

  return { email: user.email };
};

// ─── Resend password reset email for organization ───────────────────────────────

const resendOrgResetEmail = async (orgId) => {
  const org = await prisma.organization.findFirst({ where: { organizationId: Number(orgId), isDeleted: false } });
  if (!org) throw new AppError("ORGANIZATION_NOT_FOUND");
  if (!org.email) throw new AppError("VALIDATION_ERROR", "Tổ chức chưa có email");

  const { forgotPasswordOrganization } = require("../auth/auth.service");
  await forgotPasswordOrganization(org.email);

  return { email: org.email };
};

// ─── Promote user to admin or organization_leader ─────────────────────────────

const promoteUser = async (userId, { role, organization } = {}, promotedBy) => {
  const user = await prisma.user.findFirst({ where: { userId: Number(userId), isDeleted: false } });
  if (!user) throw new AppError("USER_NOT_FOUND");

  if (role === "admin") {
    await assignRole(Number(userId), "admin");
    return { userId: Number(userId), role: "admin" };
  }

  if (role === "organization_leader") {
    if (!organization?.organizationName || !organization?.organizationType) {
      throw new AppError("VALIDATION_ERROR", "Tên và loại tổ chức/CLB là bắt buộc");
    }

    const org = await prisma.organization.create({
      data: {
        organizationName: organization.organizationName,
        organizationType: organization.organizationType,
        email: organization.email || null,
        description: organization.description || null,
        createdBy: promotedBy,
      },
      select: {
        organizationId: true,
        organizationName: true,
        organizationType: true,
        email: true,
        description: true,
      },
    });

    await assignRole(Number(userId), "organization_leader");

    await prisma.organizationMember.upsert({
      where: { userId_organizationId: { userId: Number(userId), organizationId: org.organizationId } },
      update: { isDeleted: false, role: "president", createdBy: promotedBy },
      create: {
        userId: Number(userId),
        organizationId: org.organizationId,
        role: "president",
        joinDate: new Date(),
        createdBy: promotedBy,
      },
    });

    return { userId: Number(userId), role: "organization_leader", organization: org };
  }

  throw new AppError("VALIDATION_ERROR", "Role phải là 'admin' hoặc 'organization_leader'");
};

module.exports = {
  getOverviewStats,
  getActivityStats,
  getRegistrationTrend,
  createUser,
  importUsersFromCSV,
  createOrganization,
  importOrgsFromCSV,
  listUsers,
  listUsersByUniversity,
  adminUpdateUser,
  adminDeleteUser,
  adminToggleUserStatus,
  adminResetUserPassword,
  listOrganizations,
  adminUpdateOrganization,
  adminDeleteOrganization,
  adminToggleOrgStatus,
  adminResetOrgPassword,
  recoverUserAccount,
  resendResetEmail,
  resendOrgResetEmail,
  promoteUser,
};
