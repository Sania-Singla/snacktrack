import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { CORS_OPTIONS } from './Constants/index.js';
import { OK } from './Constants/errorCodes.js';
import { router } from './Routes/index.js';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../public'));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));

app.use('/api/v1', router);

app.get('/', (req, res) =>
    res.status(OK).json({
        status: 'success',
        message: 'Welcome to Snack Track!',
        uptime: `${process.uptime().toFixed(2)}s`,
        timestamp: new Date().toISOString(),
    })
);
