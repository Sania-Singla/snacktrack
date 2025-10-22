import express from 'express';
export const orderRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';

import {
    getStudentOrders,
    getCanteenOrders,
    placeOrder,
    updateOrderStatus,
    checkAvailability,
    getOrderStats,
    updateExtraCharges,
    getKitchenOrders,
} from '../Controllers/order.Controller.js';

orderRouter.use(verifyJwt);

orderRouter.route('/place').post(placeOrder);

orderRouter.route('/availability').post(checkAvailability);

orderRouter.route('/student/:studentId').get(getStudentOrders);

orderRouter.route('/canteen/:canteenId').get(getCanteenOrders);

orderRouter.route('/stats/:canteenId').get(getOrderStats);

orderRouter.route('/extra-charges/:orderId').patch(updateExtraCharges);

orderRouter.route('/kitchen').get(getKitchenOrders);

orderRouter.route('/:orderId').patch(updateOrderStatus);
