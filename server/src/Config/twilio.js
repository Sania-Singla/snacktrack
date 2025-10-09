import twilio from 'twilio';

export async function connectTwilio() {
    try {
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        console.log('📞 Twilio client ready.');
        return client;
    } catch (err) {
        throw new Error(`❌ Twilio connection failed: ${err}`);
    }
}
