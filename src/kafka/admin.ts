import { kafka } from "./client";
import { consumerinit } from "./consumer";

async function admininit() {
    try {
        const admin = kafka.admin();
        await admin.connect();
        await admin.createTopics({
            topics: [
                {
                    topic: 'contact',
                    numPartitions: 2,
                },
            ],
        });
        await admin.disconnect();
    } catch (error) {
        console.log(error)
    }
}

async function initializeKafka() {
    try {
        await admininit();
        await consumerinit();
    } catch (error) {
        console.log(error);
    }
}

export { initializeKafka };
