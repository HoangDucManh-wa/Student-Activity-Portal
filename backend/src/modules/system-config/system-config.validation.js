const { z } = require("zod");

const updateConfigSchema = z.object({
  // value is a JSON object — validate the known shapes but allow any structure
  // so new config types (e.g. domains array) don't require schema changes
  value: z.object({
    enabled: z.boolean().optional(),
    value: z.number().int().min(0).max(100000).optional(),
    domains: z.array(z.string().min(1)).optional(),
    slides: z.array(z.object({
      imageUrl: z.string(),
      linkUrl: z.string().optional(),
      alt: z.string(),
    })).optional(),
  }).passthrough(),
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
