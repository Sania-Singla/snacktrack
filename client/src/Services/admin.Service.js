import { fetchWrapper } from '../Utils';

class AdminService {
    async registerCanteen({
        fullName,
        phoneNumber,
        email,
        hostel,
        kitchenKey,
    }) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/register`,
            method: 'POST',
            aim: 'register',
            credentials: 'include',
            body: {
                fullName,
                email,
                phoneNumber,
                hostel,
                kitchenKey,
            },
        });
    }

    async sendVerificationCode({ fullName, email }) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/verify/send`,
            method: 'POST',
            aim: 'sendVerificationCode',
            body: { fullName, email },
            credentials: 'include',
        });
    }

    async verifyCode({ email, code }) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/verify/check`,
            method: 'POST',
            aim: 'verifyCode',
            body: { email, code },
            credentials: 'include',
        });
    }

    async updateContractor({
        fullName,
        phoneNumber,
        email,
        kitchenKey,
        resetAvatar = '',
        contractorId,
    }) {
        return await fetchWrapper({
            endPoint: `/admins/contractor/${contractorId}?query=${resetAvatar}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateContractor',
            body: {
                fullName,
                phoneNumber,
                email,
                kitchenKey,
            },
        });
    }

    async getContractors(key = '') {
        return await fetchWrapper({
            endPoint: `/admins/contractor`,
            method: 'POST',
            body: { key },
            aim: 'getContractors',
            credentials: 'include',
        });
    }

    async getHostels() {
        return await fetchWrapper({
            endPoint: `/admins/hostels`,
            method: 'GET',
            aim: 'getHostels',
            credentials: 'include',
        });
    }
}

export const adminService = new AdminService();
