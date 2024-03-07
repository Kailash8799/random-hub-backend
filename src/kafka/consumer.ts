import { contactProps } from '../constants/props/user';
import { kafka } from './client';
import { addContact } from './methods';

async function consumerinit() {
    const consumer = kafka.consumer({ groupId: "contact-1" });
    await consumer.connect();
    await consumer.subscribe({ topic: "contact", fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            try{
                const msg = JSON.parse(message.value.toString()) as contactProps
                console.log(msg);
                await addContact(msg);
            } catch (error) {
                console.log(error)
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: 'contact' }])
                }, 1000 * 20);
            }

        }
    })
}

export { consumerinit };