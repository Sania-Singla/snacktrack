import { twilioClient } from '../server.js';

export async function sendSMS({ to, message }) {
    try {
        const msg = await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
            body: message,
        });

        return msg.sid;
    } catch (err) {
        console.error('[Error sending sms]: ', err);
    }
}

export async function sendOrderRejectedSMS({ to, orderId }) {
    const message = `Your order with ID ${orderId} has been rejected. Please contact support for more details.`;
    return sendSMS({ to, message });
}

export async function sendOrderPlacedSMS({ to, orderId }) {
    const message = `Your order with ID ${orderId} has been placed successfully. We will notify you once it's prepared.`;
    return sendSMS({ to, message });
}

export async function sendOrderPickedUpSMS({ to, orderId }) {
    const message = `Your order with ID ${orderId} has been picked up. Enjoy your meal!`;
    return sendSMS({ to, message });
}

export async function sendOrderPreparedSMS({ to, orderId }) {
    const message = `Your order with ID ${orderId} is prepared and ready for pickup. Please collect it at your earliest.`;
    return sendSMS({ to, message });
}
