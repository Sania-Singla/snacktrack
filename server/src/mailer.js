import nodemailer from 'nodemailer';
import { transporter } from './server.js';

async function generateTransporter() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_EMAIL_PASSWORD,
            },
        });

        // Test transporter
        await transporter.verify();
        console.log('✅ Mail transporter ready.');
        return transporter;
    } catch (err) {
        console.error(`❌ Error generating mail transporter: ${err.message}`);
    }
}

async function sendMail({
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

export { generateTransporter, sendMail };
