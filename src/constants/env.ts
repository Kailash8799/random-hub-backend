require('dotenv').config()

const ENV_VAR = {
    PORT: process.env.PORT,
    PASSWORD_KEY: process.env.PASSWORD_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    MONGO_URI: process.env.MONGO_URI,
    EMAIL: process.env.EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    RANDOMHUB: process.env.RANDOMHUB,
    RANDOMHUB_BACKEND: process.env.RANDOMHUB_BACKEND,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET,
    KAFKA_TOPIC: process.env.KAFKA_TOPIC,
    KAFKA_PARTITIONS: process.env.KAFKA_PARTITIONS,
    KAFKA_BROKERS: process.env.KAFKA_BROKERS,
    KAFKA_CLIENTID: process.env.KAFKA_CLIENTID,
    KAFKA_GROUPID: process.env.KAFKA_GROUPID,
    REDIS_DB: process.env.REDIS_DB,
}

export { ENV_VAR };