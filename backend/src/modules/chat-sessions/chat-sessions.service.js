const prisma = require("../../config/prisma");
const AppError = require("../../utils/app-error");

// ─── Create a new chat session ──────────────────────────────────────────────

const createSession = async (userId, title) => {
  return prisma.chatSession.create({
    data: {
      userId,
      title: title || "Cuộc trò chuyện mới",
    },
    select: {
      sessionId: true,
      title: true,
      createdAt: true,
    },
  });
};

// ─── List sessions for user ─────────────────────────────────────────────────

const getMySessions = async (userId, { page = 1, limit = 20 } = {}) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const where = { userId, isDeleted: false };

  const [data, total] = await Promise.all([
    prisma.chatSession.findMany({
      where,
      select: {
        sessionId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.chatSession.count({ where }),
  ]);

  return {
    data,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

// ─── Get session with all messages ─────────────────────────────────────────

const getSessionById = async (sessionId, userId) => {
  const session = await prisma.chatSession.findFirst({
    where: { sessionId: Number(sessionId), userId, isDeleted: false },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!session) throw new AppError("NOT_FOUND", "Không tìm thấy phiên trò chuyện");
  return session;
};

// ─── Add messages to a session ─────────────────────────────────────────────
// Accepts an array of { role, content } pairs (user + model together).

const addMessages = async (sessionId, userId, messages) => {
  const session = await prisma.chatSession.findFirst({
    where: { sessionId: Number(sessionId), userId, isDeleted: false },
  });
  if (!session) throw new AppError("NOT_FOUND", "Không tìm thấy phiên trò chuyện");

  const created = await prisma.chatMessage.createMany({
    data: messages.map((m) => ({
      sessionId: Number(sessionId),
      role: m.role,
      content: m.content,
    })),
  });

  // Auto-update session title from first user message if still default
  if (session.title === "Cuộc trò chuyện mới") {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      const title = firstUserMsg.content.slice(0, 60);
      await prisma.chatSession.update({
        where: { sessionId: Number(sessionId) },
        data: { title, updatedAt: new Date() },
      });
    }
  } else {
    await prisma.chatSession.update({
      where: { sessionId: Number(sessionId) },
      data: { updatedAt: new Date() },
    });
  }

  return { count: created.count };
};

// ─── Delete a session (soft delete) ────────────────────────────────────────

const deleteSession = async (sessionId, userId) => {
  const session = await prisma.chatSession.findFirst({
    where: { sessionId: Number(sessionId), userId, isDeleted: false },
  });
  if (!session) throw new AppError("NOT_FOUND", "Không tìm thấy phiên trò chuyện");

  await prisma.chatSession.update({
    where: { sessionId: Number(sessionId) },
    data: { isDeleted: true },
  });
  return { deleted: true };
};

module.exports = { createSession, getMySessions, getSessionById, addMessages, deleteSession };
