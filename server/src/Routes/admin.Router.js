import express from 'express';
export const adminRouter = express.Router();
import { verifyAdminJwt } from '../Middlewares/index.js';

import {
    registerCanteen,
    sendVerificationCode,
    verifyCode,
    updateContractor,
    getContractors,
    getHostels,
    chnageContractor,
} from '../Controllers/admin.Controller.js';

adminRouter.use(verifyAdminJwt);

adminRouter.route('/contractor').post(getContractors);

adminRouter.route('/contractor/:contractorId').patch(updateContractor);
adminRouter.route('/contractor/new/:contractorId').patch(chnageContractor);

adminRouter.route('/hostels').get(getHostels);

adminRouter.route('/canteen/register').post(registerCanteen);

adminRouter.route('/canteen/verify/send').post(sendVerificationCode);

adminRouter.route('/canteen/verify/check').post(verifyCode);
