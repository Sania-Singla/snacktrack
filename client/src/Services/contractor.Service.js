import { BASE_BACKEND_URL, LIMIT } from '../Constants';
import { fetchWrapper } from '../Utils';

class ContractorService {
    async changeCanteenStatus(status) {
        return await fetchWrapper({
            endPoint: `/contractors/status`,
            method: 'PATCH',
            body: { status },
            credentials: 'include',
            aim: 'changeCanteenStatus',
        });
    }

    // student management tasks

    async getStudents({ signal, search, page = 1, limit = LIMIT }) {
        return await fetchWrapper({
            endPoint: `/contractors/students?search=${search}&page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudents',
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
            endPoint: `/contractors/students`,
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
            endPoint: `/contractors/students/register-bulk`,
            method: 'POST',
            credentials: 'include',
            aim: 'registerBulk',
            body: formData,
            type: 'formData',
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

    async updateStudent(
        studentId,
        { fullName, phoneNumber, hostelType, hostelNumber, rollNo, email }
    ) {
        return await fetchWrapper({
            endPoint: `/contractors/students/${studentId}`,
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
