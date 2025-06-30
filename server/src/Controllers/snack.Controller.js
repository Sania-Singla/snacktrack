import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Snack, PackagedFood } from '../Models/index.js';
import { Types } from 'mongoose';

const getItems = tryCatch('get food items', async (req, res) => {
    const user = req.user;
    const { page = 1, limit = 50, search = '', filter = 'snacks' } = req.query;

    const model = filter === 'snacks' ? Snack : PackagedFood;
    const result = await model.aggregatePaginate(
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

export { getItems };
