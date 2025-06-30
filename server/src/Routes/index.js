import { contractorRouter } from './contractor.Router.js';
import { snackRouter } from './snack.Router.js';
import { orderRouter } from './order.Router.js';
import { userRouter } from './user.Router.js';
import { billRouter } from './bill.Router.js';
import { adminRouter } from './admin.Router.js';
import { errorMiddleware } from '../Middlewares/index.js';
import { OK } from '../Constants/errorCodes.js';
import express from 'express';
export const router = express.Router();

router.use('/users', userRouter);
router.use('/snacks', snackRouter);
router.use('/contractors', contractorRouter);
router.use('/orders', orderRouter);
router.use('/bills', billRouter);
router.use('/admins', adminRouter);

router.get('/', (req, res) => {
    return res.status(OK).json({
        message:
            'Hi, Welcome to Snack Track 🎉, Everything is Completely Fine here 🤗',
    });
});

router.use(errorMiddleware);
