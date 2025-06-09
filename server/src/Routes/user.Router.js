import express from 'express';
export const userRouter = express.Router();
import {
    verifyJwt,
    upload,
    verifyAdminKeyJwt,
    verifyStaffKeyJwt,
} from '../Middlewares/index.js';
import {
    updateAvatar,
    updatePassword,
    getCurrentUser,
    logout,
    login,
    getContractors,
    // getKitchenOrders,
    getCanteens,
    resetPassword,
} from '../Controllers/user.Controller.js';

userRouter.route('/login').patch(login);

// for dropdowns
userRouter.route('/canteens').get(getCanteens);

userRouter.route('/contractors').post(verifyAdminKeyJwt, getContractors);

// userRouter.route('/orders').post(verifyStaffKeyJwt, getKitchenOrders);

userRouter.use(verifyJwt);

userRouter.route('/password').patch(updatePassword);

userRouter.route('/reset-password').patch(resetPassword);

userRouter.route('/avatar').patch(upload.single('avatar'), updateAvatar);

userRouter.route('/logout').patch(logout);

userRouter.route('/').get(getCurrentUser);
