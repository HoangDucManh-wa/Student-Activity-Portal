const { z } = require("zod");

const searchSchema = z.object({
  query: z.string().min(1, "Từ khóa tìm kiếm không được để trống").max(500),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

const recommendSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

const askSchema = z.object({
  question: z.string().min(1, "Câu hỏi không được để trống").max(1000),
});

module.exports = { searchSchema, recommendSchema, askSchema };
