import twilio from 'twilio';

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export async function createMessage({ to, text, link }) {
    try {
        const msg = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER, // Can't be changed in trial mode
            to: '+91' + to,
            body: `📢 Snack Track \n${text} \n🔗 Click here: ${link}`,
        });
        console.log('🔥 Message sent successfully');
    } catch (err) {
        console.error('Error sending message using Twilio: ', err);
    }
}
