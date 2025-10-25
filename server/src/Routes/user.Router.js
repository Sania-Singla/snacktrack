import express from 'express';
export const userRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';
import {
    updatePassword,
    getCurrentUser,
    logout,
    login,
    getCanteens,
    resetPassword,
    updateAccountDetails,
    verifyKitchenKey,
    verifyKioskKey,
    loginFromQR,
} from '../Controllers/user.Controller.js';

// for dropdowns
userRouter.route('/canteens').get(getCanteens);

userRouter.route('/login').patch(login);

userRouter.route('/login-by-qr').patch(loginFromQR);

userRouter.route('/verify-kiosk-key/:canteenId').post(verifyKioskKey);

userRouter.route('/verify-kitchen-key/:canteenId').post(verifyKitchenKey);

userRouter.use(verifyJwt);

userRouter.route('/account').patch(updateAccountDetails);

userRouter.route('/password').patch(updatePassword);

userRouter.route('/reset-password').patch(resetPassword);

userRouter.route('/logout').patch(logout);

userRouter.route('/').get(getCurrentUser);
