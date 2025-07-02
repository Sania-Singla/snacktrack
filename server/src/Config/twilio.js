import twilio from 'twilio';

export async function connectTwilio() {
    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Test connection
        await client.messages.create({
            body: 'Twilio connection test',
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.ADMIN_PHONE_NUMBER,
        });

        console.log('📞 Twilio client ready.');
        return client;
    } catch (err) {
        throw new Error(`❌ Twilio connection failed: ${err}`);
    }
}
