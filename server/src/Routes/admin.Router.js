import express from 'express';
export const adminRouter = express.Router();
import { verifyAdminJwt } from '../Middlewares/index.js';

import {
    registerCanteen,
    completeRegistration,
    resendVerificationCode,
    deleteCanteen,
    updateContractor,
    getContractors,
    getHostels,
} from '../Controllers/admin.Controller.js';

adminRouter.use(verifyAdminJwt);

adminRouter.route('/contractor').post(getContractors);

adminRouter
    .route('/contractor/:canteenId/:contractorId')
    .patch(updateContractor);

adminRouter.route('/hostels').get(getHostels);

adminRouter.route('/canteen/register').post(registerCanteen);

adminRouter.route('/canteen/delete/:canteenId').delete(deleteCanteen);

adminRouter.route('/canteen/complete-registeration').post(completeRegistration);

adminRouter.route('/canteen/resend-code').post(resendVerificationCode);
