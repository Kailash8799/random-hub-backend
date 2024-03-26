import { Redis } from 'ioredis';

const redisClient = new Redis({
    port: 6379,
    host: "0.0.0.0",
    username: "default", // needs Redis >= 6
    password: "eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81",
    db: 0,
});

export { redisClient };