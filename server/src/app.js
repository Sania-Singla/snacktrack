import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { CORS_OPTIONS } from './Constants/index.js';
export const app = express();
import { OK } from './Constants/errorCodes.js';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../public'));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));

import { router } from './Routes/index.js';

app.use('/api/v1', router);

app.use('/', (req, res) =>
    res.status(OK).json({
        status: 'success',
        message: '🎉 Welcome to Snack Track !!',
        description: 'Your snack logging companion is up and running 🚀',
        version: '1.0.0',
        uptime: `${process.uptime().toFixed(2)} seconds`,
        timestamp: new Date().toISOString(),
    })
);
