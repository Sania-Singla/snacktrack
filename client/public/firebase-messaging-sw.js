importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts(
    'https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js'
);

// as we cant use env in a service file so need a json file but for security we are creating it at runtime
self.addEventListener('install', async () => {
    try {
        const response = await fetch('/firebase-config.json');
        const firebaseConfig = await response.json();

        firebase.initializeApp(firebaseConfig);

        const messaging = firebase.messaging();
        messaging.onBackgroundMessage((payload) => {
            console.log(
                '[firebase-messaging-sw.js] Received background message ',
                payload
            );
            const notificationTitle = payload.notification.title;
            const notificationOptions = {
                body: payload.notification.body,
                icon: payload.notification.image,
            };

            self.registration.showNotification(
                notificationTitle,
                notificationOptions
            );
        });

        console.log('✅ [Service Worker] Firebase initialized');
    } catch (error) {
        console.error('[Service Worker] Failed to initialize Firebase:', error);
    }
});
