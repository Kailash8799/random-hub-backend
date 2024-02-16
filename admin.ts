import { kafka } from "./client";

async function init() {
    const admin = kafka.admin();
    await admin.connect();

    await admin.createTopics({
        topics: [{
            topic: 'user',
            numPartitions: 2,
        }],
    });
    await admin.disconnect();
}

init();