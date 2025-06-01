import { fetchWrapper } from '../Utils';

class ContractorService {
    // personal usage

    async register({
        fullName,
        password,
        phoneNumber,
        email,
        hostel,
        kitchenKey,
    }) {
        return await fetchWrapper({
            endPoint: `/contractors/register`,
            method: 'POST',
            aim: 'register',
            body: {
                fullName,
                password,
                email,
                phoneNumber,
                hostel,
                kitchenKey,
            },
        });
    }

    async completeRegistration({
        fullName,
        password,
        phoneNumber,
        email,
        code,
        hostel,
        kitchenKey,
    }) {
        return await fetchWrapper({
            endPoint: `/contractors/complete-registeration`,
            method: 'POST',
            aim: 'completeRegistration',
            body: {
                fullName,
                password,
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
            endPoint: `/contractors/resend-code`,
            method: 'POST',
            aim: 'resendEmailVerification',
            body: { email },
        });
    }

    async updateAccountDetails({ email, phoneNumber, fullName, password }) {
        return await fetchWrapper({
            endPoint: `/contractors/account`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateAccountDetails',
            body: { email, phoneNumber, fullName, password },
        });
    }

    // student management tasks

    async getStudents(signal, page = 1, limit = 10) {
        return await fetchWrapper({
            endPoint: `/contractors/students?page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudents',
        });
    }

    async registerStudent({ fullName, rollNo, phoneNumber, email }) {
        return await fetchWrapper({
            endPoint: `/contractors/students`,
            method: 'POST',
            credentials: 'include',
            aim: 'registerStudent',
            body: { fullName, rollNo, email, phoneNumber },
        });
    }

    async removeStudent(studentId) {
        return await fetchWrapper({
            endPoint: `/contractors/students/${studentId}`,
            method: 'DELETE',
            credentials: 'include',
            aim: 'removeStudent',
        });
    }

    async removeAllStudents(password) {
        return await fetchWrapper({
            endPoint: `/contractors/students`,
            method: 'DELETE',
            credentials: 'include',
            aim: 'removeAllStudents',
            body: { password },
        });
    }

    async updateStudentAccountDetails(
        studentId,
        { fullName, phoneNumber, rollNo, email }
    ) {
        return await fetchWrapper({
            endPoint: `/contractors/students/${studentId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateStudentAccountDetails',
            body: { fullName, phoneNumber, rollNo, email },
        });
    }

    // snack management tasks

    async removeSnack(snackId) {
        return await fetchWrapper({
            endPoint: `/contractors/snacks/${snackId}`,
            method: 'DELETE',
            credentials: 'include',
            aim: 'removeSnack',
        });
    }

    async addSnack({ image, name, price }) {
        const formData = new FormData();

        Object.entries({ image, name, price }).forEach(([key, value]) => {
            formData.append(key, value);
        });

        return await fetchWrapper({
            endPoint: `/contractors/snacks`,
            method: 'POST',
            credentials: 'include',
            aim: 'addSnack',
            body: formData,
            type: 'formData',
        });
    }

    async updateSnackDetails({ name, price, image }, snackId) {
        const formData = new FormData();
        Object.entries({ image, name, price }).forEach(([key, value]) => {
            formData.append(key, value);
        });

        return await fetchWrapper({
            endPoint: `/contractors/snacks/${snackId}`,
            method: 'PATCH',
            credentials: 'include',
            body: formData,
            type: 'formData',
            aim: 'updateSnackDetails',
        });
    }

    async toggleSnackAvailability(snackId) {
        return await fetchWrapper({
            endPoint: `/contractors/snacks/availability/${snackId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'toggleSnackAvailability',
        });
    }

    async toggleItemAvailability(itemId) {
        return await fetchWrapper({
            endPoint: `/contractors/packaged/availability/${itemId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'toggleItemAvailability',
        });
    }

    // packaged food management tasks

    async removeItem(itemId) {
        return await fetchWrapper({
            endPoint: `/contractors/packaged/${itemId}`,
            method: 'DELETE',
            credentials: 'include',
            aim: 'removeItem',
        });
    }

    async addItem(inputs) {
        return await fetchWrapper({
            endPoint: `/contractors/packaged`,
            method: 'POST',
            credentials: 'include',
            aim: 'addItem',
            body: inputs,
        });
    }

    async updateItemDetails(inputs, itemId) {
        return await fetchWrapper({
            endPoint: `/contractors/packaged/${itemId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateItemDetails',
            body: inputs,
        });
    }

    async updateKitchenKey({ password, newKey }) {
        return await fetchWrapper({
            endPoint: `/contractors/kitchen-key`,
            method: 'PATCH',
            aim: 'updateKitchenKey',
            credentials: 'include',
            body: { password, newKey },
        });
    }
}

export const contractorService = new ContractorService();
