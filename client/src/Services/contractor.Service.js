import { SERVER_ERROR, BASE_BACKEND_URL } from '../Constants/constants';

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
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/register`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName,
                        password,
                        email,
                        phoneNumber,
                        hostel,
                        kitchenKey,
                    }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in register service', err);
            throw err;
        }
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
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/complete-registeration`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName,
                        password,
                        email,
                        phoneNumber,
                        code,
                        hostel,
                        kitchenKey,
                    }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in completeRegistration service', err);
            throw err;
        }
    }

    async resendEmailVerification(email) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/resend-code`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in resendEmailVerification service', err);
            throw err;
        }
    }

    async updateAccountDetails({ email, phoneNumber, fullName, password }) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/contractors/account`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    phoneNumber,
                    fullName,
                    password,
                }),
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error(
                'error in contractor updateAccountDetails service',
                err
            );
            throw err;
        }
    }

    // student management tasks

    async getStudents(signal, page = 1, limit = 10) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/students?page=${page}&limit=${limit}`,
                { method: 'GET', signal, credentials: 'include' }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('getStudents request aborted.');
            } else {
                console.error('error in getStudents service', err);
                throw err;
            }
        }
    }

    async registerStudent({ fullName, rollNo, phoneNumber, email }) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/students`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName,
                        rollNo,
                        email,
                        phoneNumber,
                    }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in registerStudent service', err);
            throw err;
        }
    }

    async removeStudent(studentId) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/students/${studentId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in removeStudent service', err);
            throw err;
        }
    }

    async removeAllStudents(password) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/students`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in removeAllStudents service', err);
            throw err;
        }
    }

    async updateStudentAccountDetails(
        studentId,
        { fullName, phoneNumber, rollNo, password }
    ) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/students/${studentId}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName,
                        phoneNumber,
                        rollNo,
                        password,
                    }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in updateStudentAccountDetails service', err);
            throw err;
        }
    }

    // snack management tasks

    async removeSnack(snackId) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/snacks/${snackId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in deleteSnack service', err);
            throw err;
        }
    }

    async addSnack({ image, name, price }) {
        try {
            const inputs = { image, name, price };
            const formData = new FormData();
            Object.entries(inputs).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await fetch(`${BASE_BACKEND_URL}/contractors/snacks`, {
                method: 'POST',
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
            console.error('error in addSnack service', err);
            throw err;
        }
    }

    async updateSnackDetails({ name, price, image }, snackId) {
        try {
            const inputs = { image, name, price };
            console.log(inputs);
            const formData = new FormData();
            Object.entries(inputs).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/snacks/${snackId}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    body: formData,
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in updateSnackDetails service', err);
            throw err;
        }
    }

    async toggleSnackAvailability(snackId) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/snacks/availability/${snackId}`,
                { method: 'PATCH', credentials: 'include' }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in toggleSnackAvailability service', err);
            throw err;
        }
    }

    // packaged food management tasks

    async removeItem(itemId) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/packaged/${itemId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in deleteItem service', err);
            throw err;
        }
    }

    async addItem({ variants, category }) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/packaged`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        variants,
                        category,
                    }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in addItem service', err);
            throw err;
        }
    }

    async updateItemDetails({ category, variants }, itemId) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/packaged/${itemId}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        variants,
                        category,
                    }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in updateItemDetails service', err);
            throw err;
        }
    }

    async updateKitchenKey({ password, newKey }) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/contractors/kitchen-key`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password, newKey }),
                }
            );

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in user updateKitchenKey service', err);
            throw err;
        }
    }
}

export const contractorService = new ContractorService();
