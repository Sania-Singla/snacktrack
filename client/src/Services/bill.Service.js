import { LIMIT } from '../Constants';
import { fetchWrapper } from '../Utils';

class BillService {
    async getStudentBills({ studentId, signal }) {
        return await fetchWrapper({
            endPoint: `/bills/${studentId}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudentBills',
        });
    }

    async getBills({ month, page = 1, search = '', limit = LIMIT, signal }) {
        return await fetchWrapper({
            endPoint: `/bills?search=${search}&month=${month}&page=${page}&limit=${limit}`,
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

    async generateIntermediateBillForAll() {
        return await fetchWrapper({
            endPoint: '/bills/generate',
            method: 'GET',
            credentials: 'include',
            aim: 'generateIntermediateBillForAll',
        });
    }
}

export const billService = new BillService();
