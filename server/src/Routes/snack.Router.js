import express from 'express';
export const snackRouter = express.Router();
import { getItems } from '../Controllers/snack.Controller.js';
import { verifyJwt } from '../Middlewares/index.js';

snackRouter.use(verifyJwt);

snackRouter.route('/').get(getItems);
