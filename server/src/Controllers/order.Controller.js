import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Order } from '../Models/index.js';
import { Types } from 'mongoose';

// only student can do

const placeOrder = tryCatch('place order', async (req, res) => {
    const { cartItems, amount, packingCharges } = req.body;
    const student = req.user;

    // Create a new order
    const order = await Order.create({
        studentId: student._id,
        canteenId: student.canteenId,
        amount,
        items: cartItems,
        packingCharges,
    });

    // Now, populate the items just like in getCanteenOrders
    const populatedOrder = await Order.aggregate([
        { $match: { _id: order._id } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'snacks',
                localField: 'items.itemId',
                foreignField: '_id',
                as: 'snackDetails',
                pipeline: [{ $project: { name: 1, image: 1 } }],
            },
        },
        {
            $lookup: {
                from: 'packagedfoods',
                localField: 'items.itemId',
                foreignField: '_id',
                as: 'packagedFoodDetails',
                pipeline: [{ $project: { category: 1 } }],
            },
        },
        {
            $addFields: {
                'items.name': {
                    $cond: [
                        { $eq: ['$items.itemType', 'Snack'] },
                        { $arrayElemAt: ['$snackDetails.name', 0] },
                        null,
                    ],
                },
                'items.image': {
                    $cond: [
                        { $eq: ['$items.itemType', 'Snack'] },
                        { $arrayElemAt: ['$snackDetails.image', 0] },
                        null,
                    ],
                },
                'items.category': {
                    $cond: [
                        { $eq: ['$items.itemType', 'PackagedFood'] },
                        {
                            $arrayElemAt: ['$packagedFoodDetails.category', 0],
                        },
                        null,
                    ],
                },
            },
        },
        {
            $group: {
                _id: '$_id',
                amount: { $first: '$amount' },
                packingCharges: { $first: '$packingCharges' },
                status: { $first: '$status' },
                canteenId: { $first: '$canteenId' },
                studentId: { $first: '$studentId' },
                items: { $push: '$items' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
            },
        },
        { $project: { snackDetails: 0, packagedFoodDetails: 0 } },
    ]);

    if (populatedOrder.length) {
        const data = {
            ...populatedOrder[0],
            studentInfo: {
                fullName: student.fullName,
                phoneNumber: student.phoneNumber,
                avatar: student.avatar,
                userName: student.userName,
            },
        };
        return res.status(OK).json(data);
    } else return res.status(OK).json({ message: 'Order not found' });
});

// implement something to flush all the orders after 6 months to save space
const getStudentOrders = tryCatch('get student orders', async (req, res) => {
    const { limit = 10, page = 1, month } = req.query;
    const { studentId } = req.params;

    // get timestamp of the first day of the month in utc
    const monthIndex = new Date(
        `${month} 1, ${new Date().getFullYear()}`
    ).getMonth();
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, monthIndex, 1);
    const endDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59, 999);

    const result = await Order.aggregatePaginate(
        [
            {
                $match: {
                    studentId: new Types.ObjectId(studentId),
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'snackDetails',
                    pipeline: [{ $project: { name: 1, image: 1 } }],
                },
            },
            {
                $lookup: {
                    from: 'packagedfoods',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'packagedFoodDetails',
                    pipeline: [{ $project: { category: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $cond: [
                            { $eq: ['$items.itemType', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.name', 0] },
                            null,
                        ],
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.itemType', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.image', 0] },
                            null,
                        ],
                    },
                    'items.category': {
                        $cond: [
                            { $eq: ['$items.itemType', 'PackagedFood'] },
                            {
                                $arrayElemAt: [
                                    '$packagedFoodDetails.category',
                                    0,
                                ],
                            },
                            null,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    amount: { $first: '$amount' },
                    packingCharges: { $first: '$packingCharges' },
                    status: { $first: '$status' },
                    canteenId: { $first: '$canteenId' },
                    studentId: { $first: '$studentId' },
                    items: { $push: '$items' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                },
            },
            { $project: { snackDetails: 0, packagedFoodDetails: 0 } },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        }
    );

    return res.status(OK).json(
        result.docs.length
            ? {
                  orders: result.docs,
                  ordersInfo: {
                      hasNextPage: result.hasNextPage,
                      hasPrevPage: result.hasPrevPage,
                      totalOrders: result.totalDocs,
                  },
              }
            : { message: 'No orders found' }
    );
});

// only contractor can do

const updateOrderStatus = tryCatch(
    'update order status',
    async (req, res, next) => {
        const { orderId } = req.params;
        const { status } = req.query; // status: "PickedUp" or "Prepared" or "Rejected"
        const contractor = req.user;

        // Find the order and ensure it belongs to the contractor's canteen
        const order = await Order.findOneAndUpdate(
            {
                _id: new Types.ObjectId(orderId),
                canteenId: new Types.ObjectId(contractor.canteenId),
            },
            { $set: { status } },
            { new: true }
        );
        if (!order) {
            return next(new ErrorHandler('order not found', NOT_FOUND));
        }

        return res
            .status(OK)
            .json({ message: 'order status updated successfully' });
    }
);

// today's only
const getCanteenOrders = tryCatch('get canteen orders', async (req, res) => {
    const { limit = 10, page = 1, status = 'Pending' } = req.query;
    const canteenId = req.user.canteenId; // contractor

    // Get current date in UTC
    const now = new Date();
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    // Set hours in UTC
    const startOfDay = new Date(utcNow);
    startOfDay.setUTCHours(8, 0, 0, 0); // 8 AM UTC

    const endOfDay = new Date(utcNow);
    endOfDay.setUTCHours(22, 0, 0, 999); // 10 PM UTC

    // Fetch today's orders from this canteen
    const result = await Order.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(canteenId),
                    createdAt: { $gte: startOfDay, $lt: endOfDay },
                    status,
                },
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo',
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                phoneNumber: 1,
                                rollNo: 1,
                                avatar: 1,
                                userName: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'snackDetails',
                    pipeline: [{ $project: { name: 1, image: 1 } }],
                },
            },
            {
                $lookup: {
                    from: 'packagedfoods',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'packagedFoodDetails',
                    pipeline: [{ $project: { category: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $cond: [
                            { $eq: ['$items.itemType', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.name', 0] },
                            null,
                        ],
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.itemType', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.image', 0] },
                            null,
                        ],
                    },
                    'items.category': {
                        $cond: [
                            { $eq: ['$items.itemType', 'PackagedFood'] },
                            {
                                $arrayElemAt: [
                                    '$packagedFoodDetails.category',
                                    0,
                                ],
                            },
                            null,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    amount: { $first: '$amount' },
                    packingCharges: { $first: '$packingCharges' },
                    status: { $first: '$status' },
                    canteenId: { $first: '$canteenId' },
                    studentId: { $first: '$studentId' },
                    items: { $push: '$items' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    studentInfo: {
                        $first: { $arrayElemAt: ['$studentInfo', 0] },
                    },
                },
            },
            { $project: { snackDetails: 0, packagedFoodDetails: 0 } },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: 1 },
        }
    );

    return res.status(OK).json(
        result.docs.length
            ? {
                  orders: result.docs,
                  ordersInfo: {
                      hasNextPage: result.hasNextPage,
                      hasPrevPage: result.hasPrevPage,
                      totalOrders: result.totalDocs,
                  },
              }
            : { message: 'No orders found' }
    );
});

export { getStudentOrders, getCanteenOrders, placeOrder, updateOrderStatus };
