import { fetchWrapper } from '../Utils';

class AdminService {
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

    async updateContractor(inputs) {
        return await fetchWrapper({
            endPoint: `/admins/contractor/${inputs.contractorId}`,

            method: 'PATCH',
            credentials: 'include',
            aim: 'updateContractor',
            body: inputs,
        });
    }

    async addNewContractor(inputs) {
        return await fetchWrapper({
            endPoint: `/admins/contractor/new/${inputs.contractorId}`,

            method: 'PATCH',
            credentials: 'include',
            aim: 'addNewContractor',
            body: inputs,
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
