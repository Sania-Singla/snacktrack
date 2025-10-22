import { LIMIT } from '../Constants';
import { fetchWrapper } from '../Utils';

class OrderService {
    async placeOrder({ cartItems, amount }) {
        return await fetchWrapper({
            endPoint: `/orders/place`,
            method: 'POST',
            credentials: 'include',
            body: { cartItems, amount },
            aim: 'placeOrder',
        });
    }

    async updateOrderStatus({ orderId, status }) {
        return await fetchWrapper({
            endPoint: `/orders/${orderId}?status=${status}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateOrderStatus',
        });
    }

    async updateExtraCharges({ orderId, extraCharges }) {
        return await fetchWrapper({
            endPoint: `/orders/extra-charges/${orderId}`,
            method: 'PATCH',
            body: { extraCharges },
            credentials: 'include',
            aim: 'updateExtraCharges',
        });
    }

    async getStudentOrders({
        studentId,
        date = null,
        search = '',
        page = 1,
        limit = LIMIT,
        signal,
    }) {
        return await fetchWrapper({
            endPoint: `/orders/student/${studentId}?search=${search}&date=${date}&page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudentOrders',
        });
    }

    async getCanteenOrders({
        status,
        canteenId,
        date = null,
        page = 1,
        limit = LIMIT,
        signal,
        search = '',
    }) {
        return await fetchWrapper({
            endPoint: `/orders/canteen/${canteenId}?limit=${limit}&page=${page}&status=${status}&date=${date}&search=${search}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getCanteenOrders',
        });
    }

    async getKitchenOrders(signal) {
        return await fetchWrapper({
            endPoint: `/orders/kitchen`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getKitchenOrders',
        });
    }

    async checkAvailability(cartItems) {
        return await fetchWrapper({
            endPoint: `/orders/availability`,
            method: 'POST',
            credentials: 'include',
            body: { cartItems },
            aim: 'checkAvailability',
        });
    }

    async getOrderStats({ canteenId, date, signal }) {
        return await fetchWrapper({
            endPoint: `/orders/stats/${canteenId}?date=${date}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getOrderStats',
        });
    }
}

export const orderService = new OrderService();
