import express from 'express';
export const billRouter = express.Router();

import {
    getBills,
    getStudentBills,
    generateIntermediateBill,
    generateIntermediateBillsForAll,
} from '../Controllers/bill.Controller.js';
import { verifyJwt } from '../Middlewares/index.js';

billRouter.use(verifyJwt);

billRouter.route('/generate/:rollNo').get(generateIntermediateBill);
billRouter.route('/generate').get(generateIntermediateBillsForAll);
billRouter.route('/:studentId').get(getStudentBills);
billRouter.route('/').get(getBills);
