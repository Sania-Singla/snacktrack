import { SERVER_ERROR, BASE_BACKEND_URL } from '../Constants/constants';

class BillService {
    async getStudentBills(studentId, signal) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/bills/${studentId}`, {
                method: 'GET',
                signal: signal,
                credentials: 'include',
            });
            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in getStudentBills service', err);
            throw err;
        }
    }

    async getBills(page, limit, signal) {
        try {
            const res = await fetch(
                `${BASE_BACKEND_URL}/bills?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    signal: signal,
                    credentials: 'include',
                }
            );
            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in getBills service', err);
            throw err;
        }
    }
    
    async markPaid(billId) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/bills/${billId}`, {
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
            console.error('error in markPaid service', err);
            throw err;
        }
    }

    // For testing purposes only as we are using cron job to generate bills automatically
    async generateBill(studentId, month, year) {
        try {
            const res = await fetch(`${BASE_BACKEND_URL}/bills/${studentId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month, year }),
            });
            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in generateBill service', err);
            throw err;
        }
    }
}

export const billService = new BillService();
