import express from 'express';
export const orderRouter = express.Router();
import { verifyJwt } from '../Middlewares/index.js';

import {
    getStudentOrders,
    getCanteenOrders,
    placeOrder,
    updateOrderStatus,
    checkAvailability,
    getStatistics,
} from '../Controllers/order.Controller.js';

orderRouter.use(verifyJwt);

orderRouter.route('/availability').post(checkAvailability);

orderRouter.route('/statistics').get(getStatistics);

orderRouter.route('/:orderId').patch(updateOrderStatus);

orderRouter.route('/:studentId').get(getStudentOrders);

orderRouter.route('/').get(getCanteenOrders).post(placeOrder);
