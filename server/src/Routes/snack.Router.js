import express from 'express';
export const snackRouter = express.Router();

import {
    getSnacks,
    getPackagedItems,
} from '../Controllers/snack.Controller.js';

import { verifyJwt } from '../Middlewares/index.js';

snackRouter.use(verifyJwt);

snackRouter.route('/packaged').get(getPackagedItems);

snackRouter.route('/').get(getSnacks);
