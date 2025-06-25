import express from 'express';
export const billRouter = express.Router();

import {
    getBills,
    getStudentBills,
    generateIntermediateBill,
} from '../Controllers/bill.Controller.js';
import { verifyJwt } from '../Middlewares/index.js';

billRouter.use(verifyJwt);

billRouter.route('/generate/:rollNo').get(generateIntermediateBill);

billRouter.route('/:studentId').get(getStudentBills);

billRouter.route('/').get(getBills);
