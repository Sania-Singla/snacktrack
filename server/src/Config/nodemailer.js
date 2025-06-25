import nodemailer from 'nodemailer';

export async function generateTransporter() {
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
