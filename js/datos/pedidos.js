/**
 * Servicio de Órdenes y Pedidos — Supabase Edition
 * Ferretería Central - Grupo 6
 */

window.OrderService = (function () {
    'use strict';

    const supabase = window.supabase;

    /**
     * Obtener todas las órdenes (Solo Admin)
     */
    async function getOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('*, profiles(full_name), order_items(*, products(name))')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        // Mapear para mantener compatibilidad
        return data.map(o => ({
            id: o.id,
            userId: o.user_id,
            cliente: o.profiles ? o.profiles.full_name : 'Usuario',
            items: o.order_items,
            total: parseFloat(o.total_amount),
            status: o.status,
            fecha: new Date(o.created_at).toLocaleDateString(),
            type: o.delivery_type
        }));
    }

    /**
     * Obtener órdenes de un usuario específico
     */
    async function getOrdersByUser(userId) {
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, products(name))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) return [];

        return data.map(o => ({
            id: o.id,
            userId: o.user_id,
            items: o.order_items,
            total: parseFloat(o.total_amount),
            estado: o.status, // Usamos 'estado' para compatibilidad con perfil.html
            fecha: o.created_at,
            type: o.delivery_type
        }));
    }

    /**
     * Crear un nuevo pedido
     */
    async function addOrder(orderData) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return { success: false, error: 'Inicia sesión para comprar.' };

            // 1. Insertar la cabecera del pedido (Order)
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: session.user.id,
                    total_amount: orderData.total,
                    status: 'pending',
                    delivery_type: orderData.tipoEntrega || 'envio'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insertar los items del pedido
            const itemsToInsert = orderData.items.map(item => ({
                order_id: order.id,
                product_id: item.productId,
                quantity: item.cantidad,
                unit_price: item.precio
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // 3. Limpiar carrito local
            if (window.CartService) {
                window.CartService.clearCart();
            }

            return { success: true, order: order };

        } catch (err) {
            console.error('Error al procesar pedido:', err);
            return { success: false, error: err.message };
        }
    }

    /**
     * Actualizar estado de pedido (Solo Admin)
     */
    async function updateOrderStatus(orderId, newStatus) {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus.toLowerCase() })
            .eq('id', orderId);

        return !error;
    }

    return {
        getOrders,
        getOrdersByUser,
        addOrder,
        updateOrderStatus
    };

})();
