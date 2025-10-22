import { LIMIT } from '../Constants';
import { fetchWrapper } from '../Utils';

class SnackService {
    async getSnacks({ page = 1, limit = LIMIT, search = '', signal }) {
        return await fetchWrapper({
            endPoint: `/snacks?page=${page}&limit=${limit}&search=${search}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getSnacks',
        });
    }

    async getItems({ page = 1, limit = LIMIT, search = '', signal }) {
        return await fetchWrapper({
            endPoint: `/snacks/packaged?page=${page}&limit=${limit}&search=${search}`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getItems',
        });
    }
}

export const snackService = new SnackService();
