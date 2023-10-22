import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL must be defined");
}

export const redis = new Redis(process.env.REDIS_URL);
