import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const loginEmailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "15 m"),
  prefix: "rl:login:email",
});

export const loginIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, "15 m"),
  prefix: "rl:login:ip",
});
