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

    async generateIntermediateBill(rollNo) {
        return await fetchWrapper({
            endPoint: `/bills/generate/${rollNo}`,
            method: 'GET',
            credentials: 'include',
            aim: 'generateIntermediateBill',
        });
    }
}

export const billService = new BillService();
