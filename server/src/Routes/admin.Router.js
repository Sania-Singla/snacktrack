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

adminRouter.route('/hostels').get(getHostels);

adminRouter.route('/contractor').post(getContractors).patch(updateContractor);

adminRouter.route('/canteen/register').post(registerCanteen);

adminRouter.route('/canteen/delete').delete(deleteCanteen);

adminRouter.route('/canteen/complete-registeration').post(completeRegistration);

adminRouter.route('/canteen/resend-code').post(resendVerificationCode);
