import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Snack, PackagedFood } from '../Models/index.js';
import { Types } from 'mongoose';

export const getSnacks = tryCatch('get snacks', async (req, res) => {
    const user = req.user;
    const { page = 1, limit = 50, search = '' } = req.query;

    const result = await Snack.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(user.canteenId),
                    ...(search && {
                        name: { $regex: search, $options: 'i' }, // case-insensitive
                    }),
                },
            },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: 1 },
        }
    );

    return res.status(OK).json({
        snacks: result.docs,
        snacksInfo: {
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            totalCount: result.totalDocs,
        },
    });
});

export const getItems = tryCatch('get packaged items', async (req, res) => {
    const user = req.user;
    const { page = 1, limit = 50, search = '' } = req.query;

    const result = await PackagedFood.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(user.canteenId),
                    ...(search && {
                        name: { $regex: search, $options: 'i' }, // case-insensitive
                    }),
                },
            },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: 1 },
        }
    );

    return res.status(OK).json({
        items: result.docs,
        itemsInfo: {
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            totalCount: result.totalDocs,
        },
    });
});
