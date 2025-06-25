import { client } from '../Config/twilio.js';

export async function sendSMS({ to, text, link }) {
    try {
        // const msg = await client.messages.create({
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to,
        //     body: `📢 Snack Track \n${text} \n🔗 Click here: ${link}`,
        // });
        console.log('🔥 Message sent successfully');
    } catch (err) {
        console.error('Error sending message using Twilio: ', err);
    }
}
