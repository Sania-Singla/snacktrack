import { fetchWrapper } from '../Utils';

class OrderService {
    async placeOrder(cartItems, total, packingCharges) {
        return await fetchWrapper({
            endPoint: `/orders/place`,
            method: 'POST',
            credentials: 'include',
            body: {
                cartItems,
                amount: total,
                packingCharges,
            },
            aim: 'placeOrder',
        });
    }

    async updateOrderStatus(orderId, status) {
        return await fetchWrapper({
            endPoint: `/orders/${orderId}?status=${status}`,
            method: 'PATCH',
            credentials: 'include',
            aim: 'updateOrderStatus',
        });
    }

    // todo: date wise filter
    async getStudentOrders(studentId, month, page, limit, signal) {
        return await fetchWrapper({
            endPoint: `/orders/student/${studentId}?month=${month}&page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudentOrders',
        });
    }

    async getCanteenOrders(status, canteenId, date, page, limit, signal) {
        return await fetchWrapper({
            endPoint: `/orders/canteen/${canteenId}?limit=${limit}&page=${page}&status=${status}&date=${date}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getCanteenOrders',
        });
    }

    // only today's
    async getKitchenOrders(key, signal) {
        return await fetchWrapper({
            endPoint: `/orders/kitchen`,
            body: { key },
            method: 'POST',
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

    async getOrderStats(canteenId, date, signal) {
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
