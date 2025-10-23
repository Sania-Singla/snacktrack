const COOKIE_OPTIONS = {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'None',
    domain: process.env.ENV === 'prod' ? '.snacktrack.live' : '', // required for iOS
};

const CORS_OPTIONS = {
    origin: process.env.WHITELIST ? process.env.WHITELIST.split(',') : [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export { COOKIE_OPTIONS, CORS_OPTIONS };
