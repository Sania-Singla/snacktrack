import express from 'express';
export const snackRouter = express.Router();
import {
    getItems,
    getItemsVersion,
    getSnacks,
    getSnacksVersion,
} from '../Controllers/snack.Controller.js';

snackRouter.route('/:canteenId').get(getSnacks);
snackRouter.route('/version/:canteenId').get(getSnacksVersion);
snackRouter.route('/packaged/:canteenId').get(getItems);
snackRouter.route('/packaged/version/:canteenId').get(getItemsVersion);
