const express = require("express");

const router = express.Router();

const UNIVERSITIES = [
  { id: "Đại học Bách Khoa Hà Nội", name: "Đại học Bách Khoa Hà Nội" },
  { id: "Đại học Quốc gia Hà Nội", name: "Đại học Quốc gia Hà Nội" },
  { id: "Đại học Kinh tế Quốc dân", name: "Đại học Kinh tế Quốc dân" },
  { id: "Đại học Ngoại thương", name: "Đại học Ngoại thương" },
  { id: "Đại học Sư phạm Hà Nội", name: "Đại học Sư phạm Hà Nội" },
  { id: "Đại học Y Hà Nội", name: "Đại học Y Hà Nội" },
  { id: "Đại học Luật Hà Nội", name: "Đại học Luật Hà Nội" },
  { id: "Học viện Công nghệ Bưu chính Viễn thông", name: "Học viện Công nghệ Bưu chính Viễn thông" },
  { id: "Đại học FPT", name: "Đại học FPT" },
  { id: "Đại học Thăng Long", name: "Đại học Thăng Long" },
  { id: "Đại học Bách Khoa TP.HCM", name: "Đại học Bách Khoa TP.HCM" },
  { id: "Đại học Quốc gia TP.HCM", name: "Đại học Quốc gia TP.HCM" },
  { id: "Đại học Khoa học Tự nhiên TP.HCM", name: "Đại học Khoa học Tự nhiên TP.HCM" },
  { id: "Đại học Khoa học Xã hội và Nhân văn TP.HCM", name: "Đại học Khoa học Xã hội và Nhân văn TP.HCM" },
  { id: "Đại học Kinh tế TP.HCM", name: "Đại học Kinh tế TP.HCM" },
  { id: "Đại học Tôn Đức Thắng", name: "Đại học Tôn Đức Thắng" },
  { id: "Đại học Sư phạm TP.HCM", name: "Đại học Sư phạm TP.HCM" },
  { id: "Đại học Y Dược TP.HCM", name: "Đại học Y Dược TP.HCM" },
  { id: "Đại học Luật TP.HCM", name: "Đại học Luật TP.HCM" },
  { id: "Đại học Văn Lang", name: "Đại học Văn Lang" },
  { id: "Đại học Công nghệ Thông tin", name: "Đại học Công nghệ Thông tin" },
  { id: "Đại học Mở TP.HCM", name: "Đại học Mở TP.HCM" },
  { id: "Đại học Công nghiệp TP.HCM", name: "Đại học Công nghiệp TP.HCM" },
  { id: "Đại học Đà Nẵng", name: "Đại học Đà Nẵng" },
  { id: "Đại học Huế", name: "Đại học Huế" },
  { id: "Đại học Cần Thơ", name: "Đại học Cần Thơ" },
  { id: "Đại học Vinh", name: "Đại học Vinh" },
  { id: "Đại học Thái Nguyên", name: "Đại học Thái Nguyên" },
  { id: "Đại học Nông nghiệp Hà Nội", name: "Đại học Nông nghiệp Hà Nội" },
  { id: "Đại học Xây dựng", name: "Đại học Xây dựng" },
];

// GET /api/university
// Returns: { total, page, limit, data: [{ id, name }] }
// (no standard success wrapper — matches frontend UniversityGetAll type)
router.get("/", (req, res) => {
  const { query = "", sort = "1" } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const size = Number(req.query.size);

  let filtered = UNIVERSITIES;

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((u) => u.name.toLowerCase().includes(q));
  }

  if (sort === "-1") {
    filtered = [...filtered].reverse();
  }

  const total = filtered.length;

  // size = -1 means return all
  const data = size === -1 || size <= 0 ? filtered : filtered.slice((page - 1) * size, page * size);
  const limit = size === -1 || size <= 0 ? total : size;

  return res.json({ total, page, limit, data });
});

module.exports = router;
