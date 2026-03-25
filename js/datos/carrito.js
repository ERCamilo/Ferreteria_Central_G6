/**
 * Servicio del Carrito de Compras
 * Ferretería Central - Grupo 6
 */

window.CartService = (function (DB) {
    'use strict';

    function getCart() {
        return DB.get(DB.KEYS.CART) || [];
    }

    function addToCart(productId, cantidad = 1) {
        const cart = getCart();
        const existing = cart.find(item => item.productId === productId);

        if (existing) {
            existing.cantidad += cantidad;
        } else {
            cart.push({ productId, cantidad });
        }

        DB.set(DB.KEYS.CART, cart);
        return cart;
    }

    function removeFromCart(productId) {
        const cart = getCart().filter(item => item.productId !== productId);
        DB.set(DB.KEYS.CART, cart);
        return cart;
    }

    function updateCartQty(productId, cantidad) {
        const cart = getCart();
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.cantidad = Math.max(0, cantidad);
            DB.set(DB.KEYS.CART, cart);
        }
        return cart;
    }

    function clearCart() {
        DB.set(DB.KEYS.CART, []);
    }

    function getCartCount() {
        return getCart().reduce((total, item) => total + item.cantidad, 0);
    }

    async function getCartTotal() {
        const cart = getCart();
        let total = 0;
        for (const item of cart) {
            let product = null;
            if (window.Store && typeof window.Store.getProductById === 'function') {
                product = await window.Store.getProductById(item.productId);
            }

            if (product) {
                total += product.precio * item.cantidad;
            }
        }
        return total;
    }

    return {
        getCart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        getCartCount,
        getCartTotal
    };

})(window.DB);
