const { z } = require("zod");

const configValueSchema = z.union([
  z.object({ enabled: z.boolean() }),
  z.object({ value: z.number().int().min(0).max(100000) }),
]);

const updateConfigSchema = z.object({
  value: configValueSchema,
  organizationId: z.coerce.number().int().positive().optional().nullable(),
});

const configKeyParam = z.object({
  key: z.string().regex(/^[a-z][a-z0-9_.]{1,100}$/, "Invalid config key format"),
});

const orgIdParam = z.object({
  organizationId: z.coerce.number().int().positive(),
});

const categoryParam = z.object({
  category: z.string().regex(/^[a-z_]{1,50}$/, "Invalid category"),
});

module.exports = {
  updateConfigSchema,
  configKeyParam,
  orgIdParam,
  categoryParam,
};
