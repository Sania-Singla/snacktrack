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
    placeOrderByQR,
    getNewOrders,
    acceptOrder,
} from '../Controllers/order.Controller.js';

orderRouter.route('/availability').post(checkAvailability);
orderRouter.route('/place-by-qr').post(placeOrderByQR);

orderRouter.use(verifyJwt);

orderRouter.route('/place').post(placeOrder);
orderRouter.route('/student/:studentId').get(getStudentOrders);
orderRouter.route('/canteen/:canteenId').get(getCanteenOrders);
orderRouter.route('/canteen/new/:canteenId').get(getNewOrders);
orderRouter.route('/stats/:canteenId').get(getOrderStats);
orderRouter.route('/extra-charges/:orderId').patch(updateExtraCharges);
orderRouter.route('/kitchen').get(getKitchenOrders);
orderRouter.route('/accept/:orderId').patch(acceptOrder);
orderRouter.route('/:orderId').patch(updateOrderStatus);
