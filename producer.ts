import { kafka } from './client'

async function init() {
    const producer = kafka.producer({});

    // connecting producer...
    await producer.connect();

    await producer.send({
        topic: 'user',
        messages: [
            { key: 'key1', value: 'hello world', partition: 0 },
        ],
    })

    // disconnecting producer...
    await producer.disconnect();
}

init();