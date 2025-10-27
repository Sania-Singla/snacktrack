import express from 'express';
export const adminRouter = express.Router();
import { upload, verifyJwt } from '../Middlewares/index.js';

import {
    registerCanteen,
    sendVerificationCode,
    verifyCode,
    getContractors,
    getHostels,
    verifyAdminKey,
    proceedAsAdmin,
    removeAllStudents,
    removeStudent,
    updateAccountDetails,
    updatePassword,
    updateStudent,
    registerBulkStudents,
    registerStudent,
} from '../Controllers/admin.Controller.js';

adminRouter.route('/verify-key').post(verifyAdminKey);

adminRouter.use(verifyJwt);

adminRouter.route('/account').patch(updateAccountDetails);
adminRouter.route('/password').patch(updatePassword);
adminRouter.route('/proceed-as-admin/:canteenId').post(proceedAsAdmin);
adminRouter.route('/contractor').get(getContractors);
adminRouter.route('/hostels').get(getHostels);
adminRouter.route('/canteen/register').post(registerCanteen);
adminRouter.route('/canteen/verify/send').post(sendVerificationCode);
adminRouter.route('/canteen/verify/check').post(verifyCode);
adminRouter
    .route('/students/register-bulk')
    .post(upload.single('file'), registerBulkStudents);
adminRouter.route('/students').post(registerStudent).delete(removeAllStudents);
adminRouter
    .route('/students/:studentId')
    .delete(removeStudent)
    .patch(updateStudent);
