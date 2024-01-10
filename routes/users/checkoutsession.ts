require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import express from 'express'
import User from '../../models/User';
const router = express.Router();

const YOUR_DOMAIN = process.env.RANDOMHUB
const endpointSecret = process.env.WEBHOOK_SIGNING_SECRET;

router.post("/create-checkout-session", async (req, res) => {
    try {
        if (req.method !== "POST") {
            res.json({ success: false, message: "Some error occured!" });
            return;
        }
        const { plan, price, email } = req.body;
        if (email === undefined || email === null) {
            res.json({ success: false, message: "Invalid email" });
            return;
        }
        const olduser = await User.findOne({ email });
        if (!olduser) {
            res.json({ success: false, message: "Invalid email" });
            return;
        }

        const customer = await stripe.customers.create({
            name: 'Jenny Rosen',
            address: {
                line1: '510 Townsend St',
                postal_code: '98140',
                city: 'San Francisco',
                state: 'CA',
                country: 'US',
            },
            email: email,
            metadata: {
                plan: plan,
            }
        });

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'INR',
                        product_data: {
                            name: "Random Hub " + plan,
                            description: "Get a filter and skip features"
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer: customer.id,
            payment_method_types: ["card"],
            success_url: `${YOUR_DOMAIN}`,
            cancel_url: `${YOUR_DOMAIN}`,
        });
        res.json({ id: session.id, success: true, message: "Session started successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Some error occured!" }).status(401);
        return;
    }
})


router.post("/webhook-onetime-payment", async (req, res) => {
    const body = req.body;
    const payload = {
        id: body.id,
        object: 'event'
    }
    const payloadString = JSON.stringify(body);
    let event;

    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: endpointSecret,
    });

    try {
        event = stripe.webhooks.constructEvent(payloadString, header, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        if (event.type === "payment_intent.succeeded") {
            if (event.data.object.amount_received > 0) {
                stripe.customers
                    .retrieve(event.data.object.customer)
                    .then(async (customer) => {
                        try {
                            const type = customer.metadata.plan
                            if (type === "BASIC") {
                                const premiumenddate = await addMonths(new Date(), 1);
                                await User.findOneAndUpdate({ email: customer.email }, { premiumuser: true, premiumtype: "BASIC", premiumstartdate: Date.now(), premiumenddate });
                            } else if (type === "PRO") {
                                const premiumenddate = await addMonths(new Date(), 2);
                                await User.findOneAndUpdate({ email: customer.email }, { premiumuser: true, premiumtype: "PRO", premiumstartdate: Date.now(), premiumenddate });
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }).catch((err) => console.log(err.message));
            }
        }

    } catch (error) {
        console.log("Error here and")
        console.log(error)
        console.log("Error here end")
    }
    res.status(200).end();
});


async function addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
}

export default router