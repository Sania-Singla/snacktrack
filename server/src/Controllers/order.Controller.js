import { FORBIDDEN, OK, NOT_FOUND, SOCKET_EVENTS } from '../Constants/index.js';
import { ErrorHandler, tryCatch } from '../Utils/index.js';
import { Order, PackagedFood, Snack } from '../Models/index.js';
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { redisClient } from '../server.js';
import { io } from '../socket.js';

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
    const { cartItems, amount } = req.body;
    const student = req.user;

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
            redisClient.sAdd(
                `order_${order._id}`,
                JSON.stringify({ itemId: item._id, pickedUp: false })
            );
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

    // notify canteen about new order
    const cantSocketId = await redisClient.get(order.canteenId.toString());
    io.to(cantSocketId).emit(SOCKET_EVENTS.NEW_ORDER, data);

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

        const orderDate = moment(order.createdAt)
            .tz('Asia/Kolkata')
            .startOf('day');
        const todayDate = moment().tz('Asia/Kolkata').startOf('day');

        if (!orderDate.isSame(todayDate)) {
            return next(new ErrorHandler('too late', FORBIDDEN));
        }

        order.status = status;
        await order.save();

        const [completeOrder] = await Order.aggregate([
            { $match: { _id: new Types.ObjectId(orderId) } },
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
                                userName: 1,
                            },
                        },
                    ],
                },
            },
            {
                $unwind: '$studentInfo',
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
        ]);

        // delete items from redis if complete order is picked up
        if (status === 'PickedUp') {
            completeOrder.items = completeOrder.items.map((i) => ({
                ...i,
                pickedUp: true,
                prepared: true,
            }));

            await redisClient.del(`order_${order._id}`);
        } else if (status === 'Prepared') {
            const preparedItems = await redisClient.sMembers(
                `order_${order._id}`
            );

            completeOrder.items = completeOrder.items.map((item) => {
                const preparedItem = preparedItems.find((i) => {
                    const parsedItem = JSON.parse(i);
                    return item.id.equals(parsedItem.itemId);
                });

                return {
                    ...item,
                    prepared: true,
                    pickedUp: preparedItem
                        ? JSON.parse(preparedItem).pickedUp
                        : false,
                };
            });
        }

        // todo: send sms to student

        // socket event
        const [stuSocketId, cantSocketId] = await redisClient.mGet([
            order.studentId.toString(),
            order.canteenId.toString(),
        ]);

        io.to(stuSocketId)
            .to(cantSocketId)
            .emit(
                SOCKET_EVENTS[`ORDER_${status.toUpperCase()}`],
                order._id.toString()
            );

        return res.status(OK).json({
            message: 'order status updated successfully',
            order: completeOrder,
        });
    }
);

const updateExtraCharges = tryCatch(
    'update order status',
    async (req, res, next) => {
        const { orderId } = req.params;
        const { extraCharges } = req.body;
        const contractor = req.user;

        const order = await Order.findOne({
            _id: new Types.ObjectId(orderId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });

        if (!order) return next(new ErrorHandler('order not found', NOT_FOUND));
        const orderDate = moment(order.createdAt)
            .tz('Asia/Kolkata')
            .startOf('day');
        const todayDate = moment().tz('Asia/Kolkata').startOf('day');

        if (!orderDate.isSame(todayDate)) {
            return next(new ErrorHandler('too late', FORBIDDEN));
        } else if (order.status !== 'Pending' && order.status !== 'Prepared') {
            return next(
                new ErrorHandler('cannot update extra charges now', FORBIDDEN)
            );
        }

        order.extraCharges = extraCharges;
        await order.save();

        // socket event
        const [stuSocketId, cantSocketId] = await redisClient.mGet([
            order.studentId.toString(),
            order.canteenId.toString(),
        ]);

        io.to(stuSocketId)
            .to(cantSocketId)
            .emit(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, {
                orderId,
                extraCharges,
            });

        return res
            .status(OK)
            .json({ message: 'extra charges updated successfully' });
    }
);

const getStudentOrders = tryCatch('get student orders', async (req, res) => {
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
        !date || date === 'null' || !moment(date, 'YYYY-MM-DD', true).isValid()
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

    if (result.docs.length) {
        result.docs = await Promise.all(
            result.docs.map(async (order) => {
                const preparedItems = await redisClient.sMembers(
                    `order_${order._id}`
                );

                const updatedItems = order.items.map((item) => {
                    const preparedItem = preparedItems.find((i) => {
                        const parsedItem = JSON.parse(i);
                        return item.id.equals(parsedItem.itemId);
                    });

                    if (
                        order.status === 'Pending' ||
                        order.status === 'Prepared'
                    ) {
                        item.prepared = Boolean(preparedItem);
                        item.pickedUp = preparedItem
                            ? JSON.parse(preparedItem).pickedUp
                            : false;
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
        !date || date === 'null' || !moment(date, 'YYYY-MM-DD', true).isValid()
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
                    status:
                        status === 'Pending'
                            ? { $in: ['Pending', 'Prepared'] }
                            : status,
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
        { page: parseInt(page), limit: parseInt(limit), sort: { createdAt: 1 } }
    );

    if (result.docs.length) {
        result.docs = await Promise.all(
            result.docs.map(async (order) => {
                const preparedItems = await redisClient.sMembers(
                    `order_${order._id}`
                );

                const updatedItems = order.items.map((item) => {
                    let preparedItem = preparedItems.find((i) => {
                        const parsedItem = JSON.parse(i);
                        return item.id.equals(parsedItem.itemId);
                    });

                    if (
                        order.status === 'Pending' ||
                        order.status === 'Prepared'
                    ) {
                        item.prepared = Boolean(preparedItem);
                        item.pickedUp = preparedItem
                            ? JSON.parse(preparedItem).pickedUp
                            : false;
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

    result.Pending = result.Pending + result.Prepared;

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

    if (result.docs.length) {
        result.docs = await Promise.all(
            result.docs.map(async (order) => {
                let preparedItems = await redisClient.sMembers(
                    `order_${order._id}`
                );

                const updatedItems = order.items.map((item) => {
                    let preparedItem = preparedItems.find((i) => {
                        const parsedItem = JSON.parse(i);
                        return item.id.equals(parsedItem.itemId);
                    });

                    return { ...item, prepared: Boolean(preparedItem) };
                });

                return { ...order, items: updatedItems };
            })
        );
    }

    return res.status(OK).json({ orders: result.docs });
});

export {
    placeOrder,
    getOrderStats,
    getStudentOrders,
    updateOrderStatus,
    getCanteenOrders,
    checkAvailability,
    updateExtraCharges,
    getKitchenOrders,
};
