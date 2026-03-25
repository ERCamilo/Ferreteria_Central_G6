/**
 * Database Core — Capa de Datos (Local Storage Helpers)
 * Ferretería Central - Grupo 6
 * 
 * Este archivo ahora solo maneja persistencia local temporal (como el carrito)
 * mientras que los datos maestros viven en Supabase.
 */

window.DB = (function () {
    'use strict';

    const KEYS = {
        CART: 'fc_cart',
        SESSION: 'fc_session',
        PRODUCTS: 'fc_products'
    };

    /**
     * Obtener de localStorage
     */
    function get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return null;
        }
    }

    /**
     * Guardar en localStorage
     */
    function set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error writing to localStorage', e);
        }
    }

    /**
     * Generar ID único (fallback)
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    return {
        KEYS,
        get,
        set,
        generateId
    };

})();
