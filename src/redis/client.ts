import { Redis } from 'ioredis';

const redisClient = new Redis({
    port: 6379,
    host: process.env.RANDOMHUB_BACKEND,
    username: "default", // needs Redis >= 6
    password: "my-top-secret",
    db: 0,
});

export { redisClient };