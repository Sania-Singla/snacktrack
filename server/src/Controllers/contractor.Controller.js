import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    SOCKET_EVENTS,
} from '../Constants/index.js';
import { tryCatch, ErrorHandler } from '../Utils/index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../Helpers/index.js';
import { Snack, Student, PackagedFood, Canteen } from '../Models/index.js';
import { Types } from 'mongoose';
import fs from 'fs';
import { io } from '../socket.js';

export const changeCanteenStatus = tryCatch(
    'change canteen status',
    async (req, res) => {
        const contractor = req.user;
        const { status } = req.body;

        await Canteen.findByIdAndUpdate(
            contractor.canteenId,
            { $set: { isOpen: status } },
            { new: false }
        );

        io.emit(SOCKET_EVENTS.CANTEEN_OPEN_STATUS_CHANGED, {
            isOpen: status,
            canteenId: contractor.canteenId,
        });
        
        return res.status(OK).json({
            message: `canteen ${status ? 'opened' : 'closed'} successfully`,
        });
    }
);

export const getStudents = tryCatch('get students', async (req, res) => {
    const { limit = 10, page = 1, search = '' } = req.query;
    const user = req.user;

    const project =
        user.role === 'contractor'
            ? {
                  project: {
                      phoneNumber: 0,
                      email: 0,
                  },
              }
            : {};

    const result = await Student.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(req.user.canteenId),
                    ...(search && {
                        $or: [
                            { fullName: { $regex: search, $options: 'i' } },
                            {
                                $expr: {
                                    $regexMatch: {
                                        input: {
                                            $arrayElemAt: [
                                                { $split: ['$userName', '-'] },
                                                1,
                                            ],
                                        },
                                        regex: `^${search}$`, // strict match with roll number only
                                        options: 'i',
                                    },
                                },
                            },
                        ],
                    }),
                },
            },
            { $project: { password: 0, refreshToken: 0 } },
            {
                $addFields: {
                    userNumber: {
                        $toInt: {
                            $arrayElemAt: [{ $split: ['$userName', '-'] }, 1],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'bills',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'bills',
                    pipeline: [
                        {
                            $project: {
                                amount: 1,
                                paid: 1,
                                paidOn: 1,
                                month: 1,
                                year: 1,
                            },
                        },
                        { $sort: { createdAt: -1 } },
                    ],
                },
            },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { userNumber: 1 },
        },
        project
    );

    if (result.docs.length) {
        const data = {
            students: result.docs,
            studentsInfo: {
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                totalCount: result.totalDocs,
            },
        };
        return res.status(OK).json(data);
    } else {
        return res.status(OK).json({ message: 'no students found' });
    }
});

// snack management

export const addSnack = tryCatch('add snack', async (req, res) => {
    let imageURL;
    try {
        const contractor = req.user;
        const { name, price } = req.body;
        let image = req.file?.path || '';

        if (!name || !price) {
            if (image) fs.unlinkSync(image);
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        const alreadyExists = await Snack.findOne({
            // case insensitive
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (alreadyExists) {
            if (image) fs.unlinkSync(image);
            throw new ErrorHandler('snack already exists', BAD_REQUEST);
        }

        // upload image on cloudinary if have any
        if (image) {
            image = (await uploadOnCloudinary(image))?.secure_url;
            imageURL = image;
        }

        const snack = await Snack.create({
            canteenId: contractor.canteenId,
            name,
            price,
            image,
        });

        io.emit('snackAdded', snack);

        return res.status(CREATED).json(snack);
    } catch (err) {
        if (imageURL) await deleteFromCloudinary(imageURL);
        throw err;
    }
});

export const deleteSnack = tryCatch('delete post', async (req, res) => {
    const { snackId } = req.params;
    const contractor = req.user;

    // to delete a snack that should belong to the contractor's canteen
    const snack = await Snack.findOneAndDelete({
        _id: new Types.ObjectId(snackId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!snack) throw new ErrorHandler('snack not found', NOT_FOUND);
    if (snack.image) await deleteFromCloudinary(snack.image);

    io.emit('snackDeleted', { snackId: snack._id, canteenId: snack.canteenId });

    return res.status(OK).json({ message: 'snack deleted successfully' });
});

export const updateSnack = tryCatch('update snack', async (req, res) => {
    let imageURL;
    try {
        const { snackId } = req.params;
        const contractor = req.user;
        const { name, price } = req.body;
        let image = req.file?.path;

        if (!name && !price && !image) {
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        const snack = await Snack.findOne({
            _id: new Types.ObjectId(snackId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!snack) {
            if (image) fs.unlinkSync(image);
            throw new ErrorHandler('snack not found', NOT_FOUND);
        }

        if (snack.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
            // if name is being changed, check for duplicates
            const existingSnack = await Snack.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                canteenId: new Types.ObjectId(contractor.canteenId),
            });

            if (existingSnack) {
                if (image) fs.unlinkSync(image);
                throw new ErrorHandler('snack already exists', BAD_REQUEST);
            }
        }

        if (image) {
            imageURL = (await uploadOnCloudinary(image))?.secure_url;
        }

        snack.image = imageURL || snack.image;
        snack.name = name.trim() || snack.name;
        snack.price = price || snack.price;
        await snack.save();

        io.emit('snackUpdated', {
            _id: snack._id,
            canteenId: snack.canteenId,
            name: snack.name,
            price: snack.price,
            image: snack.image,
        });

        return res.status(OK).json(snack);
    } catch (err) {
        if (imageURL) await deleteFromCloudinary(imageURL);
        throw err;
    }
});

export const toggleSnackAvailability = tryCatch(
    'toggle snack availability',
    async (req, res) => {
        const { snackId } = req.params;
        const contractor = req.user;

        // a contractor can update the snack details only if the snack belongs to his canteen
        const snack = await Snack.findOne({
            _id: new Types.ObjectId(snackId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!snack) throw new ErrorHandler('snack not found', NOT_FOUND);

        snack.isAvailable = !snack.isAvailable;
        await snack.save();

        io.emit('snackUpdated', {
            _id: snack._id,
            canteenId: snack.canteenId,
            isAvailable: snack.isAvailable,
        });

        return res
            .status(OK)
            .json({ message: 'snack availability toggled successfully' });
    }
);

// packaged food management

export const addItem = tryCatch('add item', async (req, res) => {
    const contractor = req.user;
    const { name, price } = req.body;

    if (!name || !price) {
        throw new ErrorHandler('missing fields', BAD_REQUEST);
    }

    const alreadyExists = await PackagedFood.findOne({
        canteenId: new Types.ObjectId(contractor.canteenId),
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (alreadyExists) {
        throw new ErrorHandler('name already exists', BAD_REQUEST);
    }

    const item = await PackagedFood.create({
        canteenId: contractor.canteenId,
        name,
        price,
    });

    io.emit('itemAdded', item);

    return res.status(CREATED).json(item);
});

export const deleteItem = tryCatch('delete item', async (req, res) => {
    const { itemId } = req.params;
    const contractor = req.user;

    // Find the item and ensure it belongs to the contractor's canteen
    const item = await PackagedFood.findOneAndDelete({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });
    if (!item) {
        throw new ErrorHandler('item not found', NOT_FOUND);
    }

    io.emit('itemDeleted', { itemId: item._id, canteenId: item.canteenId });

    return res.status(OK).json({ message: 'item deleted successfully' });
});

export const updateItem = tryCatch('update item', async (req, res) => {
    const { itemId } = req.params;
    const contractor = req.user;
    const { name, price } = req.body;

    if (!name && !price) {
        throw new ErrorHandler('missing fields', BAD_REQUEST);
    }

    const item = await PackagedFood.findOne({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!item) {
        throw new ErrorHandler('item not found', NOT_FOUND);
    }

    if (item.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
        // if name is being changed, check for duplicates
        const existingItem = await PackagedFood.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });

        if (existingItem) {
            throw new ErrorHandler('item already exists', BAD_REQUEST);
        }
    }

    item.name = name.trim() || item.name;
    item.price = price || item.price;
    await item.save();

    io.emit('itemUpdated', {
        _id: item._id,
        canteenId: item.canteenId,
        name: item.name,
        price: item.price,
    });

    return res.status(OK).json(item);
});

export const toggleItemAvailability = tryCatch(
    'toggle item availability',
    async (req, res, next) => {
        const { itemId } = req.params;
        const contractor = req.user;

        const item = await PackagedFood.findOne({
            _id: new Types.ObjectId(itemId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!item) throw new ErrorHandler('item not found', NOT_FOUND);

        item.isAvailable = !item.isAvailable;
        await item.save();

        io.emit('itemUpdated', {
            _id: item._id,
            canteenId: item.canteenId,
            isAvailable: item.isAvailable,
        });

        return res
            .status(OK)
            .json({ message: 'item availability toggled successfully' });
    }
);
