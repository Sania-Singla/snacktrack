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

    async completeRegistration({
        fullName,
        phoneNumber,
        email,
        code,
        hostel,
        kitchenKey,
    }) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/complete-registeration`,
            method: 'POST',
            aim: 'completeRegistration',
            credentials: 'include',
            body: {
                fullName,
                email,
                phoneNumber,
                code,
                hostel,
                kitchenKey,
            },
        });
    }

    async resendEmailVerification(email) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/resend-code`,
            method: 'POST',
            aim: 'resendEmailVerification',
            body: { email },
            credentials: 'include',
        });
    }

    async deleteCanteen(canteenId) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/delete`,
            method: 'DELETE',
            aim: 'deleteCanteen',
            body: { canteenId },
            credentials: 'include',
        });
    }

    async updateContractor({ fullName, phoneNumber, email, kitchenKey }) {
        return await fetchWrapper({
            endPoint: `/admins/contractor`,
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
}

export const adminService = new AdminService();
