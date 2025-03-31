import admin from 'firebase-admin';
import { NotificationToken } from './Models/index.js';

admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
});

console.log('✅ Firebase Admin initialized from env!');

async function sendNotification(token, title, body) {
    const message = { notification: { title, body }, token };

    try {
        const response = await admin.messaging().send(message);
        console.log('🔥 Successfully sent message:', response);
    } catch (error) {
        console.error('❌ Error sending message:', error);
    }
}

async function getUserNotificationToken(userId) {
    return (await NotificationToken.findOne({ userId }))?.token;
}

export { sendNotification, getUserNotificationToken };
