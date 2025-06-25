import express from 'express';
export const orderRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';

import {
    getStudentOrders,
    getCanteenOrders,
    placeOrder,
    updateOrderStatus,
    checkAvailability,
    getKitchenOrders,
    getOrderStats,
    verifyKitchenKey,
} from '../Controllers/order.Controller.js';

orderRouter.route('/kitchen/verify-key/:canteenId').post(verifyKitchenKey);

orderRouter.use(verifyJwt);

orderRouter.route('/place').post(placeOrder);

orderRouter.route('/availability').post(checkAvailability);

orderRouter.route('/student/:studentId').get(getStudentOrders);

orderRouter.route('/canteen/:canteenId').get(getCanteenOrders);

orderRouter.route('/kitchen').get(getKitchenOrders);

orderRouter.route('/stats/:canteenId').get(getOrderStats);

orderRouter.route('/:orderId').patch(updateOrderStatus);
