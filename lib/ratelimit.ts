import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimitGenerations = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(15, "1 d"), // 15 requests per day
  analytics: true,
});
