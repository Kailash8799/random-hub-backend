import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "randomHub",
    brokers: ["192.168.224.169:9092"],
    // ssl: true,
    // logLevel: 2,
    // sasl: {
    //     mechanism: "plain",
    //     username: "kailash",
    //     password: "1234567890",
    // }
});

export { kafka };