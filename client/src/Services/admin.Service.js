import { fetchWrapper } from '../Utils';

class AdminService {
    async verifyAdminKey({ key }) {
        return await fetchWrapper({
            endPoint: `/admins/verify-key`,
            method: 'POST',
            credentials: 'include',
            body: { key },
            aim: 'verifyAdminKey',
        });
    }

    async proceedAsAdmin({ key, canteenId }) {
        return await fetchWrapper({
            endPoint: `/admins/proceed-as-admin/${canteenId}`,
            method: 'POST',
            credentials: 'include',
            body: { key },
            aim: 'proceedAsAdmin',
        });
    }

    async registerCanteen({ fullName, phoneNumber, email, hostel }) {
        return await fetchWrapper({
            endPoint: `/admins/canteen/register`,
            method: 'POST',
            aim: 'register',
            credentials: 'include',
            body: { fullName, email, phoneNumber, hostel },
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

    async updateContractor({ contractorId, inputs }) {
        return await fetchWrapper({
            endPoint: `/admins/contractor/${contractorId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateContractor',
            body: inputs,
        });
    }

    async changeContractor({ contractorId, inputs }) {
        return await fetchWrapper({
            endPoint: `/admins/contractor/new/${contractorId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'changeContractor',
            body: inputs,
        });
    }

    async getContractors() {
        return await fetchWrapper({
            endPoint: `/admins/contractor`,
            method: 'GET',
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
