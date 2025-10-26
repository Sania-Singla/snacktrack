import express from 'express';
export const adminRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';

import {
    registerCanteen,
    sendVerificationCode,
    verifyCode,
    updateContractor,
    getContractors,
    getHostels,
    verifyAdminKey,
    changeContractor,
    proceedAsAdmin,
} from '../Controllers/admin.Controller.js';

adminRouter.route('/verify-key').post(verifyAdminKey);

adminRouter.use(verifyJwt);

adminRouter.route('/proceed-as-admin/:canteenId').post(proceedAsAdmin);

adminRouter.route('/contractor').get(getContractors);

adminRouter.route('/contractor/:contractorId').patch(updateContractor);

adminRouter.route('/contractor/new/:contractorId').patch(changeContractor);

adminRouter.route('/hostels').get(getHostels);

adminRouter.route('/canteen/register').post(registerCanteen);

adminRouter.route('/canteen/verify/send').post(sendVerificationCode);

adminRouter.route('/canteen/verify/check').post(verifyCode);
