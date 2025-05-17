import { fetchWrapper } from '../Utils';

class BillService {
    async getStudentBills(studentId, signal) {
        return await fetchWrapper({
            endPoint: `/bills/${studentId}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudentBills',
        });
    }

    async getBills(month, page, limit, signal) {
        return await fetchWrapper({
            endPoint: `/bills?month=${month}&page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getBills',
        });
    }

    async generateBills() {
        return await fetchWrapper({
            endPoint: `/bills/generate`,
            method: 'GET',
            credentials: 'include',
            aim: 'generateBills',
        });
    }

    async markPaid(billId) {
        return await fetchWrapper({
            endPoint: `/bills/${billId}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'markPaid',
        });
    }
}

export const billService = new BillService();
