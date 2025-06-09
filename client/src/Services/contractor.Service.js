import { fetchWrapper } from '../Utils';

class ContractorService {
    async updateKitchenKey({ password, newKey }) {
        return await fetchWrapper({
            endPoint: `/contractors/kitchen-key`,
            method: 'PATCH',
            aim: 'updateKitchenKey',
            credentials: 'include',
            body: { password, newKey },
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

    async updateStudent(studentId, { fullName, phoneNumber, rollNo, email }) {
        return await fetchWrapper({
            endPoint: `/contractors/students/${studentId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateStudent',
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

    async updateSnack({ name, price, image }, snackId) {
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
            aim: 'updateSnack',
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

    async updateItem(inputs, itemId) {
        return await fetchWrapper({
            endPoint: `/contractors/packaged/${itemId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateItem',
            body: inputs,
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
}

export const contractorService = new ContractorService();
