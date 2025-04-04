import express from 'express';
export const billRouter = express.Router();

import {
    markPaid,
    generateBill,
    getBills,
    getStudentBills,
} from '../Controllers/bill.Controller.js';
import { verifyJwt } from '../Middlewares/index.js';

billRouter.use(verifyJwt);

billRouter.route('/:billId').patch(markPaid);
billRouter.route('/:studentId').get(getStudentBills).post(generateBill);
billRouter.route('/').get(getBills);
