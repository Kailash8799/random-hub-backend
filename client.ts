import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "randomHub",
    brokers: ["192.168.224.169:9092"],
});

export { kafka };