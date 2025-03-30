import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { CORS_OPTIONS } from './Constants/options.js';
export const app = express();

// Configurations
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('../public'));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));

// Routes
import {
    userRouter,
    snackRouter,
    contractorRouter,
    orderRouter,
} from './Routes/index.js';
import { errorMiddleware } from './Middlewares/index.js';

app.use('/api/users', userRouter); // for general user operations (login, logout...)
app.use('/api/snacks', snackRouter);
app.use('/api/contractors', contractorRouter);
app.use('/api/orders', orderRouter);

app.use(errorMiddleware);
