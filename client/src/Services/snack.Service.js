import { fetchWrapper } from '../Utils';

class SnackService {
    async getSnacks(signal) {
        return await fetchWrapper({
            endPoint: `/snacks`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getSnacks',
        });
    }

    async getPackagedFoodItems(signal) {
        return await fetchWrapper({
            endPoint: `/snacks/packaged`,
            method: 'GET',
            credentials: 'include',
            signal,
            aim: 'getPackagedFoodItems',
        });
    }
}

export const snackService = new SnackService();
