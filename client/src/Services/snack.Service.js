import { LIMIT } from '../Constants';
import { fetchWrapper } from '../Utils';

class SnackService {
    async getSnacks({
        canteenId = '',
        page = 1,
        limit = LIMIT,
        search = '',
        signal,
    }) {
        return await fetchWrapper({
            endPoint: `/snacks/${canteenId}?page=${page}&limit=${limit}&search=${search}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getSnacks',
        });
    }

    async getItems({
        canteenId = '',
        page = 1,
        limit = LIMIT,
        search = '',
        signal,
    }) {
        return await fetchWrapper({
            endPoint: `/snacks/packaged/${canteenId}?page=${page}&limit=${limit}&search=${search}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getItems',
        });
    }
}

export const snackService = new SnackService();
