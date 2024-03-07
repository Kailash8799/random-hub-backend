
import { contactProps } from '../constants/props/user';
import Contact from '../models/Contact';

async function addContact(user: contactProps) {
    try {
        const contact = new Contact({
            userId: user.userId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            subject: user.subject,
            message: user.message,
        })
        await contact.save();
    } catch (error) {
        console.log(error)
    }
}

export { addContact }