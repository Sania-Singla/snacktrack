import express from 'express';
export const userRouter = express.Router();
import { verifyJwt, upload } from '../Middlewares/index.js';
import {
    updateAvatar,
    updatePassword,
    getCurrentUser,
    logout,
    login,
    getCanteens,
    resetPassword,
    updateAccountDetails,
} from '../Controllers/user.Controller.js';

// for dropdowns
userRouter.route('/canteens').get(getCanteens);

userRouter.route('/login').patch(login);

userRouter.use(verifyJwt);

userRouter.route('/account').patch(updateAccountDetails);

userRouter.route('/password').patch(updatePassword);

userRouter.route('/reset-password').patch(resetPassword);

userRouter.route('/avatar').patch(upload.single('avatar'), updateAvatar);

userRouter.route('/logout').patch(logout);

userRouter.route('/').get(getCurrentUser);
