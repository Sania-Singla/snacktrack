import { SERVER_ERROR } from '../Constants/constants';

class OrderService {
    async placeOrder(cartItems, total) {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems: cartItems.map((i) => ({
                        itemId: i._id,
                        quantity: i.quantity,
                        itemType: i.type,
                        price: i.price,
                    })),
                    total,
                }),
            });

            const data = await res.json();
            console.log(data);

            if (res.status === SERVER_ERROR) {
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            console.error('error in placeOrder service', err);
            throw err;
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const res = await fetch(`/api/orders/${orderId}?status=${status}`, {
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
            console.error('error in updateOrderStatus service', err);
            throw err;
        }
    }

    async getStudentOrders(studentId, signal, page, limit) {
        try {
            const res = await fetch(
                `/api/orders/${studentId}?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    signal,
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
            if (err.name === 'AbortError') {
                console.log('getStudentOrders request aborted.');
            } else {
                console.error('error in getStudentOrders service', err);
                throw err;
            }
        }
    }

    async getCanteenOrders(status, page, limit, signal) {
        try {
            const res = await fetch(
                `/api/orders?limit=${limit}&page=${page}&status=${status}`,
                {
                    method: 'GET',
                    signal,
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
            if (err.name === 'AbortError') {
                console.log('getCanteenOrders request aborted.');
            } else {
                console.error('error in getCanteenOrders service', err);
                throw err;
            }
        }
    }
}

export const orderService = new OrderService();
