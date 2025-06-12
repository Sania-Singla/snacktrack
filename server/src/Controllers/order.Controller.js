import { FORBIDDEN, OK, NOT_FOUND } from '../Constants/index.js';
import { ErrorHandler, tryCatch } from '../Utils/index.js';
import { Order, PackagedFood, Snack } from '../Models/index.js';
import { Types } from 'mongoose';
import moment from 'moment';

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
            isAvailable: true,
        }),
    ]);

    const availableItems = cartItems.filter((i) => {
        if (i.type === 'Snack') {
            return snacks.some((s) => s._id.equals(i._id));
        } else {
            return packagedItems.some((p) => p._id.equals(i._id));
        }
    });

    return res.status(OK).json(availableItems);
});

const placeOrder = tryCatch('place order', async (req, res) => {
    const { cartItems, amount, packingCharges } = req.body;
    const student = req.user;

    const updatedCartItems = cartItems.map((i) => ({
        id: i._id,
        type: i.type,
        price: i.price,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions,
        isPacked: i.isPacked,
    }));

    const order = await Order.create({
        studentId: student._id,
        canteenId: student.canteenId,
        amount,
        items: updatedCartItems,
        packingCharges,
    });

    const data = {
        ...order.toObject(),
        items: cartItems,
        studentInfo: {
            fullName: student.fullName,
            phoneNumber: student.phoneNumber,
            avatar: student.avatar,
            userName: student.userName,
        },
    };

    return res.status(OK).json(data);
});

const updateOrderStatus = tryCatch(
    'update order status',
    async (req, res, next) => {
        const { orderId } = req.params;
        const { status } = req.query;
        const contractor = req.user;

        const order = await Order.findOne({
            _id: new Types.ObjectId(orderId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });

        if (!order) return next(new ErrorHandler('order not found', NOT_FOUND));

        const orderDate = moment.utc(order.createdAt).startOf('day');
        const todayDate = moment.utc().startOf('day');

        if (!orderDate.isSame(todayDate)) {
            return next(new ErrorHandler('too late', FORBIDDEN));
        }

        order.status = status;
        await order.save();

        return res
            .status(OK)
            .json({ message: 'order status updated successfully' });
    }
);

const getStudentOrders = tryCatch('get student orders', async (req, res) => {
    const { limit = 10, page = 1, month } = req.query;
    const { studentId } = req.params;

    const monthIndex = parseInt(month, 10) - 1;
    const currentYear = moment.utc().year();

    const startDate = moment
        .utc({ year: currentYear, month: monthIndex, day: 1 })
        .startOf('day')
        .toDate();

    const endDate = moment
        .utc({ year: currentYear, month: monthIndex })
        .endOf('month')
        .endOf('day')
        .toDate();

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
                    localField: 'items.id',
                    foreignField: '_id',
                    as: 'snackDetails',
                    pipeline: [{ $project: { name: 1, image: 1 } }],
                },
            },
            {
                $lookup: {
                    from: 'packagedfoods',
                    localField: 'items.id',
                    foreignField: '_id',
                    as: 'packagedFoodDetails',
                    pipeline: [{ $project: { name: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ['$items.type', 'Snack'] },
                                    then: {
                                        $arrayElemAt: ['$snackDetails.name', 0],
                                    },
                                },
                                {
                                    case: {
                                        $eq: ['$items.type', 'PackagedFood'],
                                    },
                                    then: {
                                        $arrayElemAt: [
                                            '$packagedFoodDetails.name',
                                            0,
                                        ],
                                    },
                                },
                            ],
                            default: null,
                        },
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.image', 0] },
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

const getCanteenOrders = tryCatch('get canteen orders', async (req, res) => {
    const { limit = 10, page = 1, status = 'Pending' } = req.query;
    let { date } = req.query;

    const parsedDate =
        !date || !moment(date, 'YYYY-MM-DD', true).isValid()
            ? moment.utc()
            : moment.utc(date);

    const startOfDay = parsedDate.clone().startOf('day').toDate();
    const endOfDay = parsedDate.clone().endOf('day').toDate();

    const canteenId = req.user.canteenId;

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
                    as: 'studentInfo',
                },
            },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.id',
                    foreignField: '_id',
                    pipeline: [{ $project: { name: 1, image: 1 } }],
                    as: 'snack',
                },
            },
            {
                $lookup: {
                    from: 'packagedfoods',
                    localField: 'items.id',
                    foreignField: '_id',
                    pipeline: [{ $project: { name: 1 } }],
                    as: 'packaged',
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $arrayElemAt: ['$snack.name', 0] },
                            { $arrayElemAt: ['$packaged.name', 0] },
                        ],
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $arrayElemAt: ['$snack.image', 0] },
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

const getOrderStats = tryCatch('get order stats', async (req, res) => {
    const { canteenId } = req.params;
    let { date } = req.query;

    const parsedDate =
        !date || !moment(date, 'YYYY-MM-DD', true).isValid()
            ? moment.utc()
            : moment.utc(date);

    const startOfDay = parsedDate.clone().startOf('day').toDate();
    const endOfDay = parsedDate.clone().endOf('day').toDate();

    const stats = await Order.aggregate([
        {
            $match: {
                canteenId: new Types.ObjectId(canteenId),
                createdAt: { $gte: startOfDay, $lt: endOfDay },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                status: '$_id',
                count: 1,
                _id: 0,
            },
        },
    ]);

    const result = {
        total: 0,
        pending: 0,
        prepared: 0,
        pickedUp: 0,
        rejected: 0,
    };

    stats.forEach((stat) => {
        result.total += stat.count;
        result[stat.status.toLowerCase()] = stat.count;
    });

    return res.status(OK).json(result);
});

const getKitchenOrders = tryCatch('get kitchen orders', async (req, res) => {
    const { canteenId } = req;

    const startOfDay = moment.utc().startOf('day').toDate();
    const endOfDay = moment.utc().endOf('day').toDate();

    const orders = await Order.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(canteenId),
                    createdAt: { $gte: startOfDay, $lt: endOfDay },
                    status: 'Pending',
                },
            },
            { $unwind: '$items' },
            { $match: { 'items.type': 'Snack' } },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.id',
                    foreignField: '_id',
                    as: 'snackDetails',
                    pipeline: [{ $project: { name: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.name', 0] },
                            null,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    status: { $first: '$status' },
                    canteenId: { $first: '$canteenId' },
                    studentId: { $first: '$studentId' },
                    items: { $push: '$items' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                },
            },
            { $project: { snackDetails: 0 } },
        ],
        { sort: { createdAt: 1 } }
    );

    return res.status(OK).json({ orders: orders.docs, canteenId });
});

export {
    placeOrder,
    getOrderStats,
    getStudentOrders,
    updateOrderStatus,
    getCanteenOrders,
    getKitchenOrders,
    checkAvailability,
};
