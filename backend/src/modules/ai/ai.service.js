const prisma = require("../../config/prisma");
const { getModel } = require("../../config/gemini");
const AppError = require("../../utils/app-error");

// ─── Smart Activity Search ───────────────────────────────────────────────────

const smartSearch = async (query, limit) => {
  const activities = await prisma.hoatDong.findMany({
    where: { isDelete: false },
    include: {
      toChuc: { select: { TenToChuc: true } },
      danhMuc: { select: { TenDanhMuc: true } },
    },
    orderBy: { ThoiGianBatDau: "desc" },
    take: 100,
  });

  const activityContext = activities.map((a) => ({
    id: a.MaHoatDong,
    ten: a.TenHoatDong,
    moTa: a.MoTa,
    diaDiem: a.DiaDiem,
    thoiGian: a.ThoiGianBatDau,
    toChuc: a.toChuc.TenToChuc,
    danhMuc: a.danhMuc.TenDanhMuc,
    trangThai: a.TrangThaiPheDuyet,
  }));

  const model = getModel();
  const prompt = `Given these activities: ${JSON.stringify(activityContext)}

User search query: "${query}"

Return the top ${limit} most relevant activities as a JSON array of IDs, ordered by relevance. Only return the JSON array, no other text.
Format: ["ID1", "ID2", ...]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const matchedIds = JSON.parse(
      text.replace(/```json?\n?|\n?```/g, "").trim()
    );

    const matchedActivities = await prisma.hoatDong.findMany({
      where: { MaHoatDong: { in: matchedIds }, isDelete: false },
      include: {
        toChuc: { select: { TenToChuc: true, Logo: true } },
        danhMuc: { select: { TenDanhMuc: true } },
      },
    });

    return matchedIds
      .map((id) => matchedActivities.find((a) => a.MaHoatDong === id))
      .filter(Boolean);
  } catch (err) {
    throw new AppError("AI_SERVICE_UNAVAILABLE");
  }
};

// ─── Recommendations for user ────────────────────────────────────────────────

const getRecommendations = async (maNguoiDung, limit) => {
  const [userRegistrations, upcomingActivities, memberships] =
    await Promise.all([
      prisma.phieuDangKy.findMany({
        where: { MaNguoiDung: maNguoiDung, isDelete: false },
        include: {
          hoatDong: {
            include: {
              danhMuc: { select: { TenDanhMuc: true } },
              toChuc: { select: { TenToChuc: true } },
            },
          },
        },
      }),
      prisma.hoatDong.findMany({
        where: {
          isDelete: false,
          ThoiGianBatDau: { gte: new Date() },
        },
        include: {
          toChuc: { select: { TenToChuc: true } },
          danhMuc: { select: { TenDanhMuc: true } },
        },
        take: 50,
      }),
      prisma.thanhVienToChuc.findMany({
        where: { MaNguoiDung: maNguoiDung, isDelete: false },
        include: { toChuc: { select: { TenToChuc: true } } },
      }),
    ]);

  const model = getModel();
  const prompt = `User profile:
- Past activities: ${JSON.stringify(
    userRegistrations.map((r) => ({
      ten: r.hoatDong.TenHoatDong,
      danhMuc: r.hoatDong.danhMuc.TenDanhMuc,
      toChuc: r.hoatDong.toChuc.TenToChuc,
    }))
  )}
- Club memberships: ${JSON.stringify(memberships.map((m) => m.toChuc.TenToChuc))}

Available upcoming activities: ${JSON.stringify(
    upcomingActivities.map((a) => ({
      id: a.MaHoatDong,
      ten: a.TenHoatDong,
      danhMuc: a.danhMuc.TenDanhMuc,
      toChuc: a.toChuc.TenToChuc,
      thoiGian: a.ThoiGianBatDau,
    }))
  )}

Recommend the top ${limit} activities for this user based on their interests and history.
Return as JSON array of IDs: ["ID1", "ID2", ...]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const recommendedIds = JSON.parse(
      text.replace(/```json?\n?|\n?```/g, "").trim()
    );

    const recommended = await prisma.hoatDong.findMany({
      where: { MaHoatDong: { in: recommendedIds }, isDelete: false },
      include: {
        toChuc: { select: { TenToChuc: true, Logo: true } },
        danhMuc: { select: { TenDanhMuc: true } },
      },
    });

    return recommendedIds
      .map((id) => recommended.find((a) => a.MaHoatDong === id))
      .filter(Boolean);
  } catch (err) {
    throw new AppError("AI_SERVICE_UNAVAILABLE");
  }
};

// ─── Q&A about activities ────────────────────────────────────────────────────

const askAboutActivities = async (question) => {
  const [activities, clubs, categories] = await Promise.all([
    prisma.hoatDong.findMany({
      where: { isDelete: false },
      include: {
        toChuc: { select: { TenToChuc: true } },
        danhMuc: { select: { TenDanhMuc: true } },
      },
      orderBy: { ThoiGianBatDau: "desc" },
      take: 50,
    }),
    prisma.toChuc.findMany({
      where: { isDelete: false },
      select: { TenToChuc: true, LoaiToChuc: true, MoTa: true },
    }),
    prisma.danhMucHoatDong.findMany({
      where: { isDelete: false },
      select: { TenDanhMuc: true },
    }),
  ]);

  const model = getModel();
  const prompt = `You are a helpful assistant for the Student Activity Portal.

Available data:
- Activities: ${JSON.stringify(
    activities.map((a) => ({
      ten: a.TenHoatDong,
      moTa: a.MoTa,
      diaDiem: a.DiaDiem,
      thoiGian: a.ThoiGianBatDau,
      toChuc: a.toChuc.TenToChuc,
      danhMuc: a.danhMuc.TenDanhMuc,
      trangThai: a.TrangThaiPheDuyet,
    }))
  )}
- Clubs: ${JSON.stringify(clubs)}
- Categories: ${JSON.stringify(categories)}

User question: "${question}"

Answer in Vietnamese. Be helpful and concise. If you don't have enough information, say so.`;

  try {
    const result = await model.generateContent(prompt);
    return { answer: result.response.text() };
  } catch (err) {
    throw new AppError("AI_SERVICE_UNAVAILABLE");
  }
};

module.exports = { smartSearch, getRecommendations, askAboutActivities };
