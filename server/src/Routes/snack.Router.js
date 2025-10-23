import express from 'express';
export const snackRouter = express.Router();
import { getItems, getSnacks } from '../Controllers/snack.Controller.js';

snackRouter.route('/:canteenId').get(getSnacks);
snackRouter.route('/packaged/:canteenId').get(getItems);
