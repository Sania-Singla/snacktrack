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
    from = '',
    to = '',
    subject = 'No particular subject', // to avoid spam mails
    text = '',
    html = '',
    replyTo = '',
}) {
    if (!transporter) throw new Error('❌ Transporter not initialized.');

    try {
        const mailOptions = {
            from: from
                ? `${from} <${process.env.ADMIN_EMAIL}>`
                : `Snack Track <${process.env.ADMIN_EMAIL}>`,
            to,
            subject,
            text,
            html,
            replyTo: replyTo || from || process.env.ADMIN_EMAIL,
        };

        // Headers to allow custom from address
        mailOptions.headers = {
            'X-Entity-Ref-ID': new Date().getTime().toString(),
            ...(from && {
                From: from,
                Sender: process.env.ADMIN_EMAIL,
                'Reply-To': replyTo || from,
            }),
        };

        return await transporter.sendMail(mailOptions);
    } catch (err) {
        throw new Error(`❌ Error sending mail: ${err.message}`);
    }
}

export { generateTransporter, sendMail };
