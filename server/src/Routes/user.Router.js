import express from 'express';
export const userRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';
import {
    getCurrentUser,
    logout,
    getCanteens,
    verifyKitchenKey,
    verifyKioskKey,
} from '../Controllers/user.Controller.js';

// for dropdowns
userRouter.route('/canteens').get(getCanteens);
userRouter.route('/verify-kiosk-key/:canteenId').post(verifyKioskKey);
userRouter.route('/verify-kitchen-key/:canteenId').post(verifyKitchenKey);

userRouter.use(verifyJwt);

userRouter.route('/logout').patch(logout);
userRouter.route('/').get(getCurrentUser);
