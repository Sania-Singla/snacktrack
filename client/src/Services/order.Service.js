class OrderService {
    async placeOrder(cartItems, total, packingCharges) {
        return await fetchWrapper({
            endPoint: `/orders`,
            method: 'POST',
            credentials: 'include',
            body: {
                cartItems: cartItems.map((i) => ({
                    _id: i._id,
                    quantity: i.quantity,
                    type: i.type,
                    price: i.price,
                    specialInstructions: i.specialInstructions,
                    isPacked: i.isPacked,
                })),
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

    async getStudentOrders(studentId, month, page, limit, signal) {
        return await fetchWrapper({
            endPoint: `/orders/${studentId}?month=${month}&page=${page}&limit=${limit}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStudentOrders',
        });
    }

    async getCanteenOrders(status, page, limit, signal) {
        return await fetchWrapper({
            endPoint: `/orders?limit=${limit}&page=${page}&status=${status}`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getCanteenOrders',
        });
    }

    async getStatistics(signal) {
        return await fetchWrapper({
            endPoint: `/orders/statistics`,
            method: 'GET',
            signal,
            credentials: 'include',
            aim: 'getStatistics',
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
}

export const orderService = new OrderService();
