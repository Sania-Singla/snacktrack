import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { CORS_OPTIONS } from './Constants/index.js';
export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../public'));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));

import {
    userRouter,
    snackRouter,
    contractorRouter,
    orderRouter,
    billRouter,
    adminRouter,
} from './Routes/index.js';
import { errorMiddleware } from './Middlewares/index.js';

app.use('/api/users', userRouter);
app.use('/api/snacks', snackRouter);
app.use('/api/contractors', contractorRouter);
app.use('/api/orders', orderRouter);
app.use('/api/bills', billRouter);
app.use('/api/admins', adminRouter);
app.use(errorMiddleware);

app.get('/', (req, res) => res.send('Welcome to Snack Track!'));
