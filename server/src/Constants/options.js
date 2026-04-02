export const COOKIE_OPTIONS = {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'None',
    domain: process.env.DOMAIN || '', // backend and frontend must be hostel on same domain for iOS)
};

const whitelist = process.env.WHITELIST ? process.env.WHITELIST.split(',') : [];

export const CORS_OPTIONS = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const normalized = origin.replace(/\/$/, ''); // sometimes vercel might send https://pu-snacktrack.vercel.app/ instead of https://pu-snacktrack.vercel.app, so we normalize it by removing trailing slash

        if (whitelist.includes(normalized)) {
            callback(null, true); // ✅ dynamically allows exact origin
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
