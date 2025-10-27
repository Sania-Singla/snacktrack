import { FORBIDDEN, OK, NOT_FOUND, SOCKET_EVENTS } from '../Constants/index.js';
import { ErrorHandler, tryCatch, verifyQR } from '../Utils/index.js';
import {
    Canteen,
    Order,
    PackagedFood,
    Snack,
    Student,
} from '../Models/index.js';
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { redisClient } from '../server.js';
import { io } from '../socket.js';

export const checkAvailability = tryCatch(
    'check availability',
    async (req, res) => {
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
    }
);

export const placeOrder = tryCatch('place order', async (req, res) => {
    const { cartItems, amount } = req.body;
    const student = req.user;

    const canteen = await Canteen.findById(student.canteenId)
        .select('isOpen')
        .lean();

    if (!canteen.isOpen) {
        throw new ErrorHandler('canteen is closed', FORBIDDEN);
    }

    const updatedCartItems = cartItems.map((i) => ({
        id: i._id,
        type: i.type,
        price: i.price,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions,
    }));

    const packagedItems = cartItems.filter((i) => i.type === 'PackagedFood');
    const allPackaged = packagedItems.length === cartItems.length;

    let order = await Order.create({
        studentId: student._id,
        canteenId: student.canteenId,
        amount,
        status: allPackaged ? 'Prepared' : 'Pending',
        items: updatedCartItems,
    });

    order = order.toObject();

    await Promise.all([
        packagedItems.map((item) => {
            redisClient.sAdd(`order:${order._id}:items`, item._id.toString());
        }),
    ]);

    const items = cartItems.map((item) => ({
        ...item,
        id: item._id,
        prepared: item.type === 'Snack' ? false : true,
        pickedUp: false,
    }));

    const data = {
        ...order,
        items,
        studentInfo: {
            fullName: student.fullName,
            phoneNumber: student.phoneNumber,
            userName: student.userName,
        },
    };

    // notify canteen room about new order
    io.to(`contractor_${student.canteenId}`).emit(
        SOCKET_EVENTS.NEW_ORDER,
        data
    );

    return res.status(OK).json(data);
});

export const placeOrderByQR = tryCatch(
    'place order by qr',
    async (req, res) => {
        const { cartItems, amount, canteenId, decode } = req.body;
        const { _id, token } = decode;

        if (!_id || !token) {
            throw new ErrorHandler('invalid qr code', FORBIDDEN);
        }

        const student = await Student.findOne({ _id, canteenId })
            .populate('canteenId', 'isOpen')
            .select('-refreshToken')
            .lean();

        if (!student) {
            throw new ErrorHandler('invalid qr code', NOT_FOUND);
        }

        verifyQR({ token, passHash: student.password });

        if (!student.canteenId.isOpen) {
            throw new ErrorHandler('canteen is closed', FORBIDDEN);
        }

        student.canteenId = canteenId;

        const updatedCartItems = cartItems.map((i) => ({
            id: i._id,
            type: i.type,
            price: i.price,
            quantity: i.quantity,
            specialInstructions: i.specialInstructions,
        }));

        const packagedItems = cartItems.filter(
            (i) => i.type === 'PackagedFood'
        );
        const allPackaged = packagedItems.length === cartItems.length;

        let order = await Order.create({
            studentId: _id,
            canteenId,
            amount,
            status: allPackaged ? 'Prepared' : 'Pending',
            items: updatedCartItems,
        });

        order = order.toObject();

        await Promise.all([
            packagedItems.map((item) => {
                redisClient.sAdd(
                    `order:${order._id}:items`,
                    item._id.toString()
                );
            }),
        ]);

        const items = cartItems.map((item) => ({
            ...item,
            id: item._id,
            prepared: item.type === 'Snack' ? false : true,
            pickedUp: false,
        }));

        const result = {
            ...order,
            items,
            studentInfo: {
                fullName: student.fullName,
                phoneNumber: student.phoneNumber,
                userName: student.userName,
            },
        };

        // notify canteen room about new order
        io.to(`contractor_${canteenId}`).emit(SOCKET_EVENTS.NEW_ORDER, result);

        return res.status(OK).json(result);
    }
);

export const updateOrderStatus = tryCatch(
    'update order status',
    async (req, res) => {
        const { orderId } = req.params;
        const { status } = req.query;
        const contractor = req.user;
        const { canteenId } = contractor;

        const startOfDay = moment().tz('Asia/Kolkata').startOf('day').toDate();
        const endOfDay = moment().tz('Asia/Kolkata').endOf('day').toDate();

        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                canteenId,
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
            { $set: { status } },
            { new: true }
        )
            .select('studentId')
            .lean();

        if (!order) {
            throw new ErrorHandler('too late or not found', FORBIDDEN);
        }

        let completeOrder = null;
        if (status === 'Prepared') {
            [completeOrder] = await Order.aggregate([
                { $match: { _id: new Types.ObjectId(orderId) } },
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
                                    userName: 1,
                                },
                            },
                        ],
                    },
                },
                { $unwind: '$studentInfo' },
                { $unwind: '$items' },
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
                        extraCharges: { $first: '$extraCharges' },
                        status: { $first: '$status' },
                        canteenId: { $first: '$canteenId' },
                        studentId: { $first: '$studentId' },
                        items: { $push: '$items' },
                        createdAt: { $first: '$createdAt' },
                        updatedAt: { $first: '$updatedAt' },
                        studentInfo: { $first: '$studentInfo' },
                    },
                },
                { $project: { snack: 0, packaged: 0 } },
            ]);

            const preparedItems = await redisClient.sMembers(
                `order:${orderId}:items`
            );
            const pickupHash = await redisClient.hGetAll(
                `order:${orderId}:pickup`
            );

            const preparedSet = new Set(preparedItems);

            completeOrder.items = completeOrder.items.map((item) => ({
                ...item,
                prepared: preparedSet.has(item.id.toString()),
                pickedUp: pickupHash[item.id.toString()] === '1' || false,
            }));
        } else {
            // pickedUp or rejected (because ho skta hai prepared hone ke baad reject krvaya ho)
            await redisClient.del(`order:${order._id}:items`);
            await redisClient.del(`order:${order._id}:pickup`);
        }

        // socket event
        const stuSocketId = await redisClient.get(order.studentId.toString());

        const data =
            status === 'Prepared' ? { order: completeOrder, orderId } : orderId;

        io.to([stuSocketId, `contractor_${canteenId}`]).emit(
            SOCKET_EVENTS[`ORDER_${status.toUpperCase()}`],
            data
        );

        return res
            .status(OK)
            .json({ message: 'order status updated successfully' });
    }
);

export const updateExtraCharges = tryCatch(
    'update extra charges',
    async (req, res) => {
        const { orderId } = req.params;
        const { extraCharges } = req.body;
        const contractor = req.user;
        const { canteenId } = contractor;

        const startOfDay = moment().tz('Asia/Kolkata').startOf('day').toDate();
        const endOfDay = moment().tz('Asia/Kolkata').endOf('day').toDate();

        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                canteenId,
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
                status: { $in: ['Pending', 'Prepared'] },
            },
            { $set: { extraCharges } },
            { new: true }
        )
            .select('studentId')
            .lean();

        if (!order) {
            throw new ErrorHandler('too late or not found', FORBIDDEN);
        }

        // socket event
        const stuSocketId = await redisClient.get(order.studentId.toString());
        io.to(stuSocketId)
            .to(`contractor_${canteenId}`)
            .emit(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, {
                orderId,
                extraCharges,
            });

        return res
            .status(OK)
            .json({ message: 'extra charges updated successfully' });
    }
);

export const getStudentOrders = tryCatch(
    'get student orders',
    async (req, res) => {
        const { limit = 10, page = 1, date, search = '' } = req.query;
        const { studentId } = req.params;

        const matchConditions = { studentId: new Types.ObjectId(studentId) };

        if (search) {
            const searchRegex = new RegExp(search.toLowerCase(), 'i');

            matchConditions.$expr = {
                $and: [
                    { $eq: ['$studentId', new Types.ObjectId(studentId)] },
                    {
                        $regexMatch: {
                            input: { $substr: [{ $toString: '$_id' }, 16, 8] },
                            regex: searchRegex,
                        },
                    },
                ],
            };

            // Remove studentId from top-level, since it’s in $expr now
            delete matchConditions.studentId;
        }

        const istDate =
            !date ||
            date === 'null' ||
            !moment(date, 'YYYY-MM-DD', true).isValid()
                ? moment.tz('Asia/Kolkata')
                : moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata');

        const startOfDay = istDate.clone().startOf('day').utc().toDate();
        const endOfDay = istDate.clone().endOf('day').utc().toDate();

        const result = await Order.aggregatePaginate(
            [
                {
                    $match: {
                        ...matchConditions,
                        createdAt: { $gte: startOfDay, $lt: endOfDay },
                    },
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
                        extraCharges: { $first: '$extraCharges' },
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

        let orders = result.docs;

        if (orders.length) {
            orders = await Promise.all(
                orders.map(async (order) => {
                    if (order.status === 'PickedUp') return order;

                    const preparedItems = await redisClient.sMembers(
                        `order:${order._id.toString()}:items`
                    );
                    const pickupHash = await redisClient.hGetAll(
                        `order:${order._id.toString()}:pickup`
                    );

                    const preparedSet = new Set(preparedItems);

                    const updatedItems = order.items.map((item) => ({
                        ...item,
                        prepared: preparedSet.has(item.id.toString()),
                        pickedUp:
                            pickupHash[item.id.toString()] === '1' || false,
                    }));

                    return { ...order, items: updatedItems };
                })
            );
        }
        return res.status(OK).json({
            orders,
            ordersInfo: {
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                totalOrders: result.totalDocs,
            },
        });
    }
);

export const getCanteenOrders = tryCatch(
    'get canteen orders',
    async (req, res) => {
        const {
            limit = 10,
            page = 1,
            status = 'Pending',
            search = '',
        } = req.query;
        let { date } = req.query;

        const istDate =
            !date ||
            date === 'null' ||
            !moment(date, 'YYYY-MM-DD', true).isValid()
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
                    $unwind: '$studentInfo',
                },
                {
                    $match: search
                        ? {
                              $or: [
                                  {
                                      'studentInfo.rollNumber': {
                                          $regex: search,
                                          $options: 'i',
                                      },
                                  },
                                  //   {
                                  //       $expr: {
                                  //           $regexMatch: {
                                  //               input: {
                                  //                   $substr: [
                                  //                       { $toString: '$_id' },
                                  //                       16,
                                  //                       8,
                                  //                   ],
                                  //               },
                                  //               regex: new RegExp(
                                  //                   search.toLowerCase(),
                                  //                   'i'
                                  //               ),
                                  //           },
                                  //       },
                                  //   },
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
                        extraCharges: { $first: '$extraCharges' },
                        status: { $first: '$status' },
                        canteenId: { $first: '$canteenId' },
                        studentId: { $first: '$studentId' },
                        items: { $push: '$items' },
                        createdAt: { $first: '$createdAt' },
                        updatedAt: { $first: '$updatedAt' },
                        studentInfo: { $first: '$studentInfo' },
                    },
                },
                { $project: { snack: 0, packaged: 0 } },
            ],
            {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { createdAt: 1 },
            }
        );

        let orders = result.docs;

        if (orders.length) {
            orders = await Promise.all(
                orders.map(async (order) => {
                    if (order.status === 'PickedUp') return order;

                    const preparedItems = await redisClient.sMembers(
                        `order:${order._id.toString()}:items`
                    );
                    const pickupHash = await redisClient.hGetAll(
                        `order:${order._id.toString()}:pickup`
                    );

                    const preparedSet = new Set(preparedItems);

                    const updatedItems = order.items.map((item) => ({
                        ...item,
                        prepared: preparedSet.has(item.id.toString()),
                        pickedUp:
                            pickupHash[item.id.toString()] === '1' || false,
                    }));

                    return { ...order, items: updatedItems };
                })
            );
        }

        return res.status(OK).json({
            orders,
            ordersInfo: {
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                totalOrders: result.totalDocs,
            },
        });
    }
);

export const getOrderStats = tryCatch('get order stats', async (req, res) => {
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

    result.incomplete = result.Pending + result.Prepared;

    return res.status(OK).json(result);
});

export const getKitchenOrders = tryCatch(
    'get kitchen orders',
    async (req, res) => {
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
                { $addFields: { 'items.name': { $first: '$snack.name' } } },
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
                { $project: { snack: 0 } },
            ],
            { sort: { createdAt: 1 } }
        );

        let orders = result.docs;

        if (orders.length) {
            orders = await Promise.all(
                orders.map(async (order) => {
                    const preparedItems = await redisClient.sMembers(
                        `order:${order._id.toString()}:items`
                    );

                    const preparedSet = new Set(preparedItems);

                    const updatedItems = order.items.map((item) => ({
                        ...item,
                        prepared: preparedSet.has(item.id.toString()),
                    }));

                    return { ...order, items: updatedItems };
                })
            );
        }

        return res.status(OK).json({ orders });
    }
);
