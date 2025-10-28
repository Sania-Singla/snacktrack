import { fetchWrapper } from '../Utils';

class StudentService {
    async login({ userName, password }) {
        return await fetchWrapper({
            endPoint: `/students/login`,
            method: 'PATCH',
            credentials: 'include',
            body: { userName, password },
            aim: 'login',
        });
    }

    async loginByQR(decode) {
        return await fetchWrapper({
            endPoint: `/students/login-by-qr`,
            method: 'PATCH',
            credentials: 'include',
            body: { decode },
            aim: 'loginByQR',
        });
    }

    // async updatePassword({ oldPassword, newPassword }) {
    //     return await fetchWrapper({
    //         endPoint: `/students/password`,
    //         method: 'PATCH',
    //         credentials: 'include',
    //         body: { newPassword, oldPassword },
    //         aim: 'updatePassword',
    //     });
    // }

    async updatePassword({ token, newPassword }) {
        return await fetchWrapper({
            endPoint: `/students/password`,
            method: 'PATCH',
            credentials: 'include',
            body: { token, newPassword },
            aim: 'updatePassword',
        });
    }
}

export const studentService = new StudentService();
