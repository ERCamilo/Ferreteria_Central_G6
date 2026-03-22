/**
 * Servicio de Órdenes y Pedidos
 * Ferretería Central - Grupo 6
 */

window.OrderService = (function (DB, AuthService, CartService) {
    'use strict';

    function getOrders() {
        return DB.get(DB.KEYS.ORDERS) || [];
    }

    function getOrdersByUser(userId) {
        return getOrders().filter(o => o.userId === userId);
    }

    function addOrder(orderData) {
        const orders = getOrders();
        // Intentar obtener sesión desde AuthService, si no está disponible, usar DB manual
        let session = null;
        if (AuthService) {
             session = AuthService.getSession();
        } else {
             session = DB.get(DB.KEYS.SESSION);
        }

        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            userId: session ? session.id : 'guest',
            cliente: session ? session.nombre : 'Invitado',
            items: orderData.items,
            total: orderData.total,
            direccion: orderData.direccion || '',
            tipoEntrega: orderData.tipoEntrega || 'envio',
            fecha: new Date().toLocaleDateString('es-DO', {
                day: '2-digit', month: 'short', year: 'numeric'
            }),
            estado: 'Pendiente'
        };

        orders.unshift(newOrder); // Agregar al inicio
        DB.set(DB.KEYS.ORDERS, orders);

        // Limpiar carrito después de comprar
        if (CartService) {
             CartService.clearCart();
        } else {
             DB.set(DB.KEYS.CART, []);
        }

        return newOrder;
    }

    function updateOrderStatus(orderId, newStatus) {
        const orders = getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.estado = newStatus;
            DB.set(DB.KEYS.ORDERS, orders);
            return true;
        }
        return false;
    }

    return {
        getOrders,
        getOrdersByUser,
        addOrder,
        updateOrderStatus
    };

})(window.DB, window.AuthService, window.CartService);
