import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Order, PackagedFood, Snack } from '../Models/index.js';
import { Types } from 'mongoose';

// only student can do

const placeOrder = tryCatch('place order', async (req, res) => {
    const { cartItems, amount, packingCharges } = req.body;
    const student = req.user;

    const updatedCartItems = cartItems.map((i) => ({
        itemId: i._id,
        quantity: i.quantity,
        itemType: i.type,
        price: i.price,
        specialInstructions: i.specialInstructions,
        isPacked: i.isPacked,
    }));

    // Create a new order
    const order = await Order.create({
        studentId: student._id,
        canteenId: student.canteenId,
        amount,
        items: updatedCartItems,
        packingCharges,
    });

    // update inventory for packaged Items
    const packagedItems = cartItems.filter((item) => item.type !== 'Snack');

    for (const item of packagedItems) {
        await PackagedFood.updateOne(
            { _id: item._id, 'variants.price': item.price },
            { $inc: { 'variants.$.availableCount': -item.quantity } }
        );
    }

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

    const now = new Date();

    // Set start time (8 AM)
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Set end time (10 PM)
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

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

const checkAvailability = tryCatch('check availability', async (req, res) => {
    const { cartItems } = req.body;

    const [snacks, packagedItems] = await Promise.all([
        Snack.find({
            _id: {
                $in: cartItems
                    .filter((i) => i.type === 'Snack')
                    .map((i) => i._id),
            },
            isAvailable: true,
        }),
        PackagedFood.find({
            _id: {
                $in: cartItems
                    .filter((i) => i.type !== 'Snack')
                    .map((i) => i._id),
            },
        }),
    ]);

    // Filter available items
    const availableItems = cartItems.filter((i) => {
        if (i.type === 'Snack') {
            return snacks.some((s) => s._id.equals(i._id));
        } else {
            const item = packagedItems.find((p) => p._id.equals(i._id));
            if (!item) return false;

            const variant = item.variants.find((v) => v.price === i.price);
            if (variant && variant.availableCount > 0) {
                i.availableCount = variant.availableCount; // Added availableCount to response
                return true;
            }
            return false;
        }
    });

    return res.status(OK).json(availableItems);
});

const getStatistics = tryCatch('get statistics', async (req, res) => {
    const { canteenId } = req.user;
    const currentYear = new Date().getFullYear();

    const monthlySales = await Order.aggregate([
        {
            $match: {
                canteenId: new Types.ObjectId(canteenId),
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lt: new Date(`${currentYear + 1}-01-01`),
                },
                status: 'PickedUp',
            },
        },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'snacks',
                localField: 'items.itemId',
                foreignField: '_id',
                as: 'snackData',
            },
        },
        {
            $lookup: {
                from: 'packagedfoods',
                localField: 'items.itemId',
                foreignField: '_id',
                as: 'packagedFoodData',
            },
        },
        {
            $addFields: {
                itemDetails: {
                    $cond: [
                        { $eq: ['$items.itemType', 'Snack'] },
                        { $arrayElemAt: ['$snackData', 0] },
                        { $arrayElemAt: ['$packagedFoodData', 0] },
                    ],
                },
            },
        },
        {
            $project: {
                month: { $month: '$createdAt' },
                itemId: '$items.itemId',
                itemType: '$items.itemType',
                itemName: {
                    $cond: [
                        { $eq: ['$items.itemType', 'Snack'] },
                        '$itemDetails.name',
                        '$itemDetails.category',
                    ],
                },
                price: '$items.price',
                quantity: '$items.quantity',
                revenue: { $multiply: ['$items.price', '$items.quantity'] },
            },
        },
        {
            $group: {
                _id: {
                    month: '$month',
                    itemId: '$itemId',
                    itemType: '$itemType',
                },
                itemName: { $first: '$itemName' },
                itemPrice: { $first: '$price' },
                totalQuantity: { $sum: '$quantity' },
                totalRevenue: { $sum: '$revenue' },
            },
        },
        {
            $group: {
                _id: '$_id.month',
                month: { $first: '$_id.month' },
                monthlyTotal: { $sum: '$totalRevenue' },
                items: {
                    $push: {
                        itemId: '$_id.itemId',
                        itemType: '$_id.itemType',
                        itemName: '$itemName',
                        itemPrice: '$itemPrice',
                        totalQuantity: '$totalQuantity',
                        totalRevenue: '$totalRevenue',
                    },
                },
            },
        },
        { $project: { _id: 0, month: 1, items: 1, monthlyTotal: 1 } },
        { $sort: { month: 1 } },
    ]);

    const yearlyStats = {
        totalRevenue: monthlySales.reduce(
            (sum, month) => sum + month.monthlyTotal,
            0
        ),
        totalItemsSold: monthlySales.reduce((sum, month) => {
            return (
                sum +
                month.items.reduce(
                    (itemSum, item) => itemSum + item.totalQuantity,
                    0
                )
            );
        }, 0),
    };

    // Then add average calculation
    yearlyStats.averageMonthlyRevenue =
        monthlySales.length > 0
            ? yearlyStats.totalRevenue / monthlySales.length
            : 0;

    return res.status(200).json({
        year: currentYear,
        monthlySales,
        yearlySummary: yearlyStats, // Use the pre-calculated object
    });
});

export {
    getStudentOrders,
    getCanteenOrders,
    placeOrder,
    updateOrderStatus,
    checkAvailability,
    getStatistics,
};
