import express from 'express';
export const billRouter = express.Router();

import {
    markPaid,
    getBills,
    getStudentBills,
} from '../Controllers/bill.Controller.js';
import { verifyJwt } from '../Middlewares/index.js';

billRouter.use(verifyJwt);

billRouter.route('/:billId').patch(markPaid);
billRouter.route('/:studentId').get(getStudentBills);
billRouter.route('/').get(getBills);
