import { SERVER_ERROR } from '../Constants/constants';

class UserService {
    async login({ loginInput, password, role }) {
        try {
            const res = await fetch('/api/users/login', {
                method: 'PATCH',
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
            const res = await fetch('/api/users/password', {
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

            const res = await fetch('/api/users/avatar', {
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
            const res = await fetch('/api/users/current', {
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
            const res = await fetch('/api/users/logout', {
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
            const res = await fetch('/api/users/contractors', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
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
            const res = await fetch('/api/users/orders', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
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
            const res = await fetch('/api/users/canteens', {
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

    async resendEmailVerification(email) {
        try {
            const res = await fetch('/api/users/resend-mail', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in resendVerificationEmail service', err);
            throw err;
        }
    }
}

export const userService = new UserService();
