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

    async registerStudent({
        fullName,
        rollNo,
        phoneNumber,
        email,
        hostelType,
        hostelNumber,
    }) {
        return await fetchWrapper({
            endPoint: `/admins/students`,
            method: 'POST',
            credentials: 'include',
            aim: 'registerStudent',
            body: {
                fullName,
                rollNo,
                email,
                hostelType,
                hostelNumber,
                phoneNumber,
            },
        });
    }

    async registerBulk({ file, hostelNumber, hostelType }) {
        const formData = new FormData();

        Object.entries({ file, hostelNumber, hostelType }).forEach(
            ([key, value]) => {
                formData.append(key, value);
            }
        );

        return await fetchWrapper({
            endPoint: `/admins/students/register-bulk`,
            method: 'POST',
            credentials: 'include',
            aim: 'registerBulk',
            body: formData,
            type: 'formData',
        });
    }

    async removeStudent(studentId) {
        return await fetchWrapper({
            endPoint: `/admins/students/${studentId}`,
            method: 'DELETE',
            credentials: 'include',
            aim: 'removeStudent',
        });
    }

    async removeAllStudents(password) {
        return await fetchWrapper({
            endPoint: `/admins/students`,
            method: 'DELETE',
            credentials: 'include',
            aim: 'removeAllStudents',
            body: { password },
        });
    }

    async updateStudent(
        studentId,
        { fullName, phoneNumber, hostelType, hostelNumber, rollNo, email }
    ) {
        return await fetchWrapper({
            endPoint: `/admins/students/${studentId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateStudent',
            body: {
                fullName,
                phoneNumber,
                hostelType,
                hostelNumber,
                rollNo,
                email,
            },
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

    async updatePassword({ newPassword }) {
        return await fetchWrapper({
            endPoint: `/admins/password`,
            method: 'PATCH',
            credentials: 'include',
            body: { newPassword },
            aim: 'updatePassword',
        });
    }

    async updateAccountDetails({ fullName, phoneNumber, email }) {
        return await fetchWrapper({
            endPoint: `/admins/account`,
            method: 'PATCH',
            credentials: 'include',
            body: { fullName, phoneNumber, email },
            aim: 'updateAccountDetails',
        });
    }
}

export const adminService = new AdminService();
