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

    async getBills(page, limit, signal) {
        return await fetchWrapper({
            endPoint: `/bills?page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getBills',
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
