import express from 'express';
export const snackRouter = express.Router();

import {
    getSnacks,
    getPackagedFoodItems,
} from '../Controllers/snack.Controller.js';
import { verifyJwt } from '../Middlewares/index.js';

snackRouter.use(verifyJwt);

snackRouter.route('/packaged').get(getPackagedFoodItems);
snackRouter.route('/').get(getSnacks);
