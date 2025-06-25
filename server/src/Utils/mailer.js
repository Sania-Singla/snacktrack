import { transporter } from '../server.js';

export async function sendMail({
    senderName = 'Snack Track',
    senderMail = process.env.ADMIN_EMAIL,
    receiverName,
    receiverMail,
    replyToMail = '',
    subject = 'No particular subject',
    text = '',
    html = '',
}) {
    if (!transporter) throw new Error('❌ Transporter not initialized.');

    try {
        const mailOptions = {
            from: `${senderName} <${senderMail}>`, // although would always show admin email
            to: `${receiverName} <${receiverMail}>`,
            replyTo: replyToMail || senderMail,
            subject,
            text,
            html,
            headers: {
                'X-Entity-Ref-ID': new Date().getTime().toString(),
            },
        };

        return await transporter.sendMail(mailOptions);
    } catch (err) {
        throw new Error(`❌ Error sending mail: ${err.message}`);
    }
}
