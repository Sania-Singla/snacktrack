import { SERVER_ERROR, BASE_BACKEND_URL } from '../Constants/constants';

class UserService {
    async login({ loginInput, password, role }) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/login`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginInput, password, role }),
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in user login service', err);
            throw err;
        }
    }

    async updatePassword({ oldPassword, newPassword }) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/password`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newPassword,
                    oldPassword,
                }),
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in user updatePassword service', err);
            throw err;
        }
    }

    async updateAvatar(avatar) {
        try {
            const formData = new FormData();
            formData.append('avatar', avatar);

            const res = await fetch(`${BASE_BACKEND_URL}/users/avatar`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData,
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in user updateAvatar service', err);
            throw err;
        }
    }

    async getCurrentUser(signal) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/current`, {
                method: 'GET',
                credentials: 'include',
                signal,
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('fetch current user request aborted');
            } else {
                console.error('error in getCurrentUser service', err);
                throw err;
            }
        }
    }

    async logout() {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/logout`, {
                method: 'PATCH',
                credentials: 'include',
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in logout service', err);
            throw err;
        }
    }

    async getContractors(key = '') {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/contractors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
                credentials: 'include',
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in getContractors service', err);
            throw err;
        }
    }

    async getOrders(key = '') {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
                credentials: 'include',
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in getOrders service', err);
            throw err;
        }
    }

    async getCanteens(signal) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/canteens`, {
                method: 'GET',
                signal,
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in getCanteens service', err);
            throw err;
        }
    }

    async sendQuery({ subject, message }) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/users/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message }),
                credentials: 'include',
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in sendQuery service', err);
            throw err;
        }
    }
}

export const userService = new UserService();
