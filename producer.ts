import { kafka } from './client'

async function init() {
    const producer = kafka.producer({});

    // connecting producer...
    await producer.connect();
    for (let index = 0; index < 100000; index++) {
        await producer.send({
            topic: 'user',
            messages: [
                { key: 'key', value: 'hello world', partition: 0 },
            ],
        })
    }
    // disconnecting producer...
    await producer.disconnect();
}

init();