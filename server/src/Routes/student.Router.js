import express from 'express';
export const studentRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';
import {
    updatePassword,
    login,
    loginFromQR,
} from '../Controllers/student.Controller.js';

studentRouter.route('/login').patch(login);
studentRouter.route('/login-by-qr').patch(loginFromQR);

studentRouter.use(verifyJwt);

studentRouter.route('/password').patch(updatePassword);
