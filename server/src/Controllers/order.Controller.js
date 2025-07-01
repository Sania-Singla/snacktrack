import {
    FORBIDDEN,
    OK,
    NOT_FOUND,
    COOKIE_OPTIONS,
    BAD_REQUEST,
} from '../Constants/index.js';
import { ErrorHandler, tryCatch } from '../Utils/index.js';
import { Canteen, Order, PackagedFood, Snack } from '../Models/index.js';
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { redisClient } from '../server.js';
import { generateStaffToken } from '../Helpers/tokens.js';
import bcrypt from 'bcryptjs';

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
                    .filter((i) => i.type === 'PackagedFood')
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

    const packagedItems = cartItems.filter((i) => i.type === 'PackagedFood');
    const allPackaged = packagedItems.length === cartItems.length;

    const order = await Order.create({
        studentId: student._id,
        canteenId: student.canteenId,
        amount,
        status: allPackaged ? 'Prepared' : 'Pending',
        items: updatedCartItems,
        packingCharges,
    });

    await Promise.all([
        packagedItems.map((item) => {
            redisClient.sAdd(
                `order_${order._id}`,
                JSON.stringify({
                    itemId: item._id,
                    prepared: item.quantity,
                    pickedUp: 0,
                })
            );
        }),
    ]);

    const items = cartItems.map((item) => ({
        ...item,
        preparedCount: item.type === 'Snack' ? 0 : item.quantity,
        pickedUpCount: 0,
    }));

    const data = {
        ...order.toObject(),
        items,
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

        const orderDate = moment().utc(order.createdAt).startOf('day');
        const todayDate = moment().utc().startOf('day');

        if (!orderDate.isSame(todayDate)) {
            return next(new ErrorHandler('too late', FORBIDDEN));
        }

        order.status = status;
        await order.save();

        // delete prepared items from redis
        if (order.status === 'PickedUp') {
            const preparedItems = await redisClient.sMembers(
                `order_${order._id}`
            );
            if (preparedItems.length)
                await redisClient.del(`order_${order._id}`);
        }

        return res
            .status(OK)
            .json({ message: 'order status updated successfully' });
    }
);

const getStudentOrders = tryCatch('get student orders', async (req, res) => {
    const { limit = 10, page = 1, month, date, search = '' } = req.query;
    const { studentId } = req.params;

    const matchConditions = { studentId: new Types.ObjectId(studentId) };

    if (search) {
        const searchRegex = new RegExp(search.toLowerCase(), 'i'); // case-insensitive

        matchConditions.$expr = {
            $regexMatch: {
                input: {
                    $substr: [{ $toString: '$_id' }, 16, 8], // formatted ID: last 8 chars
                },
                regex: searchRegex,
            },
        };
    }

    if (date && date !== 'undefined') {
        // Specific date filtering
        const istStart = moment
            .tz(date, 'Asia/Kolkata')
            .startOf('day')
            .utc()
            .toDate();
        const istEnd = moment
            .tz(date, 'Asia/Kolkata')
            .endOf('day')
            .utc()
            .toDate();
        matchConditions.createdAt = { $gte: istStart, $lte: istEnd };
    } else if (month) {
        // Month-based filtering (fallback)
        const monthIndex = parseInt(month, 10) - 1;
        const currentYear = moment.utc().year();

        const istStart = moment
            .tz(
                { year: currentYear, month: monthIndex, day: 1 },
                'Asia/Kolkata'
            )
            .startOf('day')
            .utc()
            .toDate();

        const istEnd = moment
            .tz({ year: currentYear, month: monthIndex }, 'Asia/Kolkata')
            .endOf('month')
            .endOf('day')
            .utc()
            .toDate();

        matchConditions.createdAt = { $gte: istStart, $lte: istEnd };
    }

    const result = await Order.aggregatePaginate(
        [
            {
                $match: matchConditions,
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.id',
                    foreignField: '_id',
                    as: 'snack',
                    pipeline: [{ $project: { name: 1, image: 1 } }],
                },
            },
            {
                $lookup: {
                    from: 'packagedfoods',
                    localField: 'items.id',
                    foreignField: '_id',
                    as: 'packaged',
                    pipeline: [{ $project: { name: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $first: '$snack.name' },
                            { $first: '$packaged.name' },
                        ],
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $first: '$snack.image' },
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
            { $project: { snack: 0, packaged: 0 } },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        }
    );

    if (result.docs.length) {
        result.docs = await Promise.all(
            result.docs.map(async (order) => {
                const preparedItems = await redisClient.sMembers(
                    `order_${order._id}`
                );

                const updatedItems = order.items.map((item) => {
                    const preparedItem = preparedItems
                        .map((i) => JSON.parse(i))
                        .find((i) => item.id.equals(i.itemId));

                    if (
                        order.status === 'Pending' ||
                        order.status === 'Prepared'
                    ) {
                        item.preparedCount = preparedItem?.prepared || 0;
                        item.pickedUpCount = preparedItem?.pickedUp || 0;
                    }
                    return item;
                });

                return { ...order, items: updatedItems };
            })
        );
    }
    return res.status(OK).json({
        orders: result.docs,
        ordersInfo: {
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            totalOrders: result.totalDocs,
        },
    });
});

const getCanteenOrders = tryCatch('get canteen orders', async (req, res) => {
    const { limit = 10, page = 1, status = 'Pending', search = '' } = req.query;
    let { date } = req.query;

    const istDate =
        !date || !moment(date, 'YYYY-MM-DD', true).isValid()
            ? moment.tz('Asia/Kolkata')
            : moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata');

    const startOfDay = istDate.clone().startOf('day').utc().toDate();
    const endOfDay = istDate.clone().endOf('day').utc().toDate();

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
                        {
                            $addFields: {
                                rollNumber: {
                                    $arrayElemAt: [
                                        { $split: ['$userName', '-'] },
                                        1,
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'studentInfo',
                },
            },
            {
                $addFields: { student: { $first: '$studentInfo' } },
            },
            {
                $match: search
                    ? {
                          $or: [
                              {
                                  'student.fullName': {
                                      $regex: search,
                                      $options: 'i',
                                  },
                              },
                              {
                                  'student.rollNumber': {
                                      $regex: search,
                                      $options: 'i',
                                  },
                              },
                              {
                                  $expr: {
                                      $regexMatch: {
                                          input: {
                                              $substr: [
                                                  { $toString: '$_id' },
                                                  16,
                                                  8,
                                              ],
                                          },
                                          regex: new RegExp(
                                              search.toLowerCase(),
                                              'i'
                                          ),
                                      },
                                  },
                              },
                          ],
                      }
                    : {},
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
                            { $first: '$snack.name' },
                            { $first: '$packaged.name' },
                        ],
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.type', 'Snack'] },
                            { $first: '$snack.image' },
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
                    studentInfo: { $first: '$student' },
                },
            },
            { $project: { snack: 0, packaged: 0 } },
        ],
        { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: 1 } }
    );

    if (result.docs.length) {
        result.docs = await Promise.all(
            result.docs.map(async (order) => {
                const preparedItems = await redisClient.sMembers(
                    `order_${order._id}`
                );

                const updatedItems = order.items.map((item) => {
                    const preparedItem = preparedItems
                        .map((i) => JSON.parse(i))
                        .find((i) => item.id.equals(i.itemId));

                    if (
                        order.status === 'Pending' ||
                        order.status === 'Prepared'
                    ) {
                        item.preparedCount = preparedItem?.prepared || 0;
                        item.pickedUpCount = preparedItem?.pickedUp || 0;
                    }
                    return item;
                });

                return { ...order, items: updatedItems };
            })
        );
    }

    return res.status(OK).json({
        orders: result.docs,
        ordersInfo: {
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            totalOrders: result.totalDocs,
        },
    });
});

const getOrderStats = tryCatch('get order stats', async (req, res) => {
    const { canteenId } = req.params;
    let { date } = req.query;

    const istDate =
        !date || !moment(date, 'YYYY-MM-DD', true).isValid()
            ? moment.tz('Asia/Kolkata')
            : moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata');

    const startOfDay = istDate.clone().startOf('day').utc().toDate();
    const endOfDay = istDate.clone().endOf('day').utc().toDate();

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
        Total: 0,
        Pending: 0,
        Prepared: 0,
        PickedUp: 0,
        Rejected: 0,
    };

    stats.forEach((stat) => {
        result.Total += stat.count;
        result[stat.status] = stat.count;
    });

    return res.status(OK).json(result);
});

const getKitchenOrders = tryCatch('get kitchen orders', async (req, res) => {
    const { canteenId } = req.user;

    const istNow = moment.tz('Asia/Kolkata');
    const startOfDay = istNow.clone().startOf('day').utc().toDate();
    const endOfDay = istNow.clone().endOf('day').utc().toDate();

    const result = await Order.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(canteenId),
                    createdAt: { $gte: startOfDay, $lt: endOfDay },
                    status: 'Pending',
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
                $addFields: { student: { $first: '$studentInfo' } },
            },
            { $match: { 'items.type': 'Snack' } },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.id',
                    foreignField: '_id',
                    as: 'snack',
                    pipeline: [{ $project: { name: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': { $first: '$snack.name' },
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
                    studentInfo: { $first: '$student' },
                },
            },
            { $project: { snack: 0 } },
        ],
        { sort: { createdAt: 1 } }
    );

    // filter out prepared items as well
    if (result.docs.length) {
        result.docs = await Promise.all(
            result.docs.map(async (order) => {
                const preparedItems = await redisClient.sMembers(
                    `order_${order._id}`
                );

                const updatedItems = order.items.map((item) => {
                    const preparedItem = preparedItems
                        .map((i) => JSON.parse(i))
                        .find((i) => item.id.equals(i.itemId));

                    return {
                        ...item,
                        preparedCount: preparedItem?.prepared || 0,
                    };
                });

                return { ...order, items: updatedItems };
            })
        );
    }

    return res.status(OK).json({ orders: result.docs });
});

const verifyKitchenKey = tryCatch(
    'verify kitchen key',
    async (req, res, next) => {
        const { key } = req.body;
        const { canteenId } = req.params;

        if (!canteenId) {
            return next(new ErrorHandler('missing canteenId', BAD_REQUEST));
        }

        if (!key) {
            return next(new ErrorHandler('missing key', BAD_REQUEST));
        }

        const canteen = await Canteen.findById(canteenId);

        const isValid = bcrypt.compareSync(key, canteen.kitchenKey);
        if (!isValid) {
            return res.status(BAD_REQUEST).json({ message: 'Invalid key' });
        }

        const staffToken = await generateStaffToken({
            key,
            canteenId,
            role: 'staff',
        });

        const { hostelName, hostelNumber, hostelType } = canteen;

        return res
            .status(OK)
            .cookie('staffToken', staffToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.STAFF_TOKEN_MAXAGE),
            })
            .clearCookie('accessToken', COOKIE_OPTIONS)
            .clearCookie('refreshToken', COOKIE_OPTIONS)
            .json({
                user: {
                    userId: null,
                    canteenId,
                    role: 'staff',
                    hostelType,
                    hostelNumber,
                    hostelName,
                },
            });
    }
);

export {
    placeOrder,
    getOrderStats,
    getStudentOrders,
    updateOrderStatus,
    getCanteenOrders,
    getKitchenOrders,
    checkAvailability,
    verifyKitchenKey,
};
