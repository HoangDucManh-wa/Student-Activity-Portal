import { z } from 'zod'


const envVariable = {
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_API_URL: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).nullable(),
  COOKIE_ACCESS_TOKEN_MAX_AGE: z.string().optional(),
  COOKIE_REFRESH_TOKEN_MAX_AGE: z.string().optional(),
}



const envSchema = z.object({
  ...envVariable,
})

const result = await envSchema.safeParseAsync({
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
  COOKIE_ACCESS_TOKEN_MAX_AGE: process.env.COOKIE_ACCESS_TOKEN_MAX_AGE,
  COOKIE_REFRESH_TOKEN_MAX_AGE: process.env.COOKIE_REFRESH_TOKEN_MAX_AGE,
})

if (!result.success) {
  throw new Error(result.error.message)
}

export const envConfig = result.data