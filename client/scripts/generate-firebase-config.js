import fs from 'fs';

const config = {
    apiKey: process.env.VITE_API_KEY,
    authDomain: process.env.VITE_AUTH_DOMAIN,
    projectId: process.env.VITE_PROJECT_ID,
    storageBucket: process.env.VITE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_APP_ID,
    measurementId: process.env.VITE_MEASUREMENT_ID,
};

// Write the config file to public
fs.writeFileSync(
    './public/firebase-config.json',
    JSON.stringify(config, null, 2)
);

console.log('✅ Firebase config file generated!');
