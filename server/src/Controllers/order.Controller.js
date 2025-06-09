import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Canteen, Order, PackagedFood, Snack } from '../Models/index.js';
import { Types } from 'mongoose';

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

    const populatedOrder = {
        ...order.toObject(),
        items: cartItems,
    };

    const data = {
        ...populatedOrder,
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

        const order = await Order.findOneAndUpdate(
            {
                _id: new Types.ObjectId(orderId),
                canteenId: new Types.ObjectId(contractor.canteenId),
            },
            { $set: { status } },
            { new: true }
        );
        if (!order) return next(new ErrorHandler('order not found', NOT_FOUND));

        return res
            .status(OK)
            .json({ message: 'order status updated successfully' });
    }
);

// TODO: date wise also

const getStudentOrders = tryCatch('get student orders', async (req, res) => {
    const { limit = 10, page = 1, month } = req.query;
    const { studentId } = req.params;

    // get timestamp of the first day of the month in utc
    const monthIndex = parseInt(month, 10) - 1; // 0-based for JS Date()
    const currentYear = new Date().getUTCFullYear();

    const startDate = new Date(
        Date.UTC(currentYear, monthIndex, 1, 0, 0, 0, 0)
    );
    const endDate = new Date(
        Date.UTC(currentYear, monthIndex + 1, 0, 23, 59, 59, 999)
    );

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

// today's only
const getCanteenOrders = tryCatch('get canteen orders', async (req, res) => {
    const { limit = 10, page = 1, status = 'Pending' } = req.query;
    const canteenId = req.user.canteenId; // contractor

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

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

// for kitchen page
const getKitchenOrders = tryCatch(
    'get kitchen orders',
    async (req, res, next) => {
        const { hostelType, hostelNumber } = req;

        const canteen = await Canteen.findOne({
            hostelType,
            hostelNumber,
        }).select('_id');

        const now = new Date();

        // Set start time
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        // Set end time
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch today's orders from this canteen
        const orders = await Order.aggregatePaginate(
            [
                {
                    $match: {
                        canteenId: new Types.ObjectId(canteen._id),
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

        return res
            .status(OK)
            .json({ canteenId: canteen._id, orders: orders.docs });
    }
);

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

    // Filter available items
    const availableItems = cartItems.filter((i) => {
        if (i.type === 'Snack') {
            return snacks.some((s) => s._id.equals(i._id));
        } else {
            return packagedItems.some((p) => p._id.equals(i._id));
        }
    });

    return res.status(OK).json(availableItems);
});

export {
    placeOrder,
    getStudentOrders,
    updateOrderStatus,
    getCanteenOrders,
    getKitchenOrders,
    checkAvailability,
};
