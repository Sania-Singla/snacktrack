import { fetchWrapper } from '../Utils';

class UserService {
    async verifyKitchenKey({ key, canteenId }) {
        return await fetchWrapper({
            endPoint: `/users/verify-kitchen-key/${canteenId}`,
            method: 'POST',
            credentials: 'include',
            body: { key },
            aim: 'verifyKitchenKey',
        });
    }

    async getCurrentUser() {
        return await fetchWrapper({
            endPoint: `/users`,
            method: 'GET',
            credentials: 'include',
            aim: 'getCurrentUser',
        });
    }

    async logout() {
        return await fetchWrapper({
            endPoint: `/users/logout`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'logout',
        });
    }

    async getCanteens(signal) {
        return await fetchWrapper({
            endPoint: `/users/canteens`,
            method: 'GET',
            signal,
            aim: 'getCanteens',
        });
    }
}

export const userService = new UserService();
