import { fetchWrapper } from '../Utils';

class UserService {
    async login({ loginInput, password, role }) {
        return await fetchWrapper({
            endPoint: `/users/login`,
            method: 'PATCH',
            credentials: 'include',
            body: { loginInput, password, role },
            aim: 'login',
        });
    }

    async updatePassword({ oldPassword, newPassword }) {
        return await fetchWrapper({
            endPoint: `/users/password`,
            method: 'PATCH',
            credentials: 'include',
            body: { newPassword, oldPassword },
            aim: 'updatePassword',
        });
    }

    async resetPassword() {
        return await fetchWrapper({
            endPoint: `/users/reset-password`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'resetPassword',
        });
    }

    async updateAvatar(avatar) {
        const formData = new FormData();
        formData.append('avatar', avatar);

        return await fetchWrapper({
            endPoint: `/users/avatar`,
            method: 'PATCH',
            credentials: 'include',
            body: formData,
            aim: 'updateAvatar',
            type: 'formData',
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

    async getContractors(key = '') {
        return await fetchWrapper({
            endPoint: `/users/contractors`,
            method: 'POST',
            credentials: 'include',
            body: { key },
            aim: 'getContractors',
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
