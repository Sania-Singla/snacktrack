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

    async getSnacksVersion({ canteenId = '', signal }) {
        return await fetchWrapper({
            endPoint: `/snacks/version/${canteenId}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getSnacksVersion',
        });
    }

    async getItemsVersion({ canteenId = '', signal }) {
        return await fetchWrapper({
            endPoint: `/snacks/packaged/version/${canteenId}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getItemsVersion',
        });
    }
}

export const snackService = new SnackService();
