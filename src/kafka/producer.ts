import { Partitioners } from 'kafkajs';
import { contactProps } from '../constants/props/user';
import { kafka } from './client'

async function contactproducer(user: contactProps) {
    const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
    // connecting producer...
    await producer.connect();
    await producer.send({
        topic: 'contact',
        messages: [
            { key: 'contact', value: JSON.stringify(user), partition: 0 },
        ],
    })
    // disconnecting producer...
    await producer.disconnect();
}

export { contactproducer };