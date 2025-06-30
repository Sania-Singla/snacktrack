import { LIMIT } from '../Constants/constants';
import { fetchWrapper } from '../Utils';

class SnackService {
    async getItems({
        page = 1,
        filter = 'snacks',
        limit = LIMIT,
        search = '',
        signal,
    }) {
        return await fetchWrapper({
            endPoint: `/snacks?filter=${filter}&page=${page}&limit=${limit}&search=${search}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getItems',
        });
    }
}

export const snackService = new SnackService();
