const COOKIE_OPTIONS = {
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'None',
    domain: '.snacktrack.live',
};

const CORS_OPTIONS = {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

export { COOKIE_OPTIONS, CORS_OPTIONS };
