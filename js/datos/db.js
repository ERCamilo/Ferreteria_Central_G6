/**
 * Database Core — Capa de Datos
 * Ferretería Central - Grupo 6
 * 
 * Contiene helpers y la inicialización de la base de datos (localStorage).
 */

window.DB = (function () {
    'use strict';

    const KEYS = {
        USERS: 'fc_users',
        SESSION: 'fc_session',
        PRODUCTS: 'fc_products',
        CART: 'fc_cart',
        ORDERS: 'fc_orders'
    };

    function get(key) {
        return JSON.parse(localStorage.getItem(key)) || null;
    }

    function set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    const DEFAULT_PRODUCTS = [
        {
            id: 'prod001',
            nombre: 'Taladro Percutor 750W',
            descripcion: 'Taladro percutor profesional con velocidad variable y mango auxiliar.',
            precio: 129.99,
            stock: 15,
            categoria: 'Herramientas Eléctricas',
            imagen: 'assets/taladro.avif'
        },
        {
            id: 'prod002',
            nombre: 'Juego de Llaves Combinadas',
            descripcion: 'Set completo de llaves combinadas en acero cromo-vanadio.',
            precio: 89.99,
            stock: 20,
            categoria: 'Herramientas Manuales',
            imagen: 'assets/caja-herramientas.jpeg'
        },
        {
            id: 'prod003',
            nombre: 'Amoladora Angular 115mm',
            descripcion: 'Amoladora angular de 900W con disco de 115mm y protección de seguridad.',
            precio: 79.99,
            stock: 12,
            categoria: 'Herramientas Eléctricas',
            imagen: 'assets/compresor.jpeg'
        },
        {
            id: 'prod004',
            nombre: 'Caja de Herramientas Pro',
            descripcion: 'Caja de herramientas resistente con 5 compartimentos y cerradura.',
            precio: 59.99,
            stock: 25,
            categoria: 'Almacenamiento',
            imagen: 'assets/caja-herramientas.jpeg'
        },
        {
            id: 'prod005',
            nombre: 'Martillo Carpintero 20oz',
            descripcion: 'Martillo de acero forjado con mango de fibra de vidrio anti-vibración.',
            precio: 24.99,
            stock: 50,
            categoria: 'Herramientas Manuales',
            imagen: 'assets/taladro.avif'
        },
        {
            id: 'prod006',
            nombre: 'Sierra Circular 7-1/4"',
            descripcion: 'Sierra circular de 1800W con guía laser y disco incluido.',
            precio: 149.99,
            stock: 8,
            categoria: 'Herramientas Eléctricas',
            imagen: 'assets/compresor.jpeg'
        },
        {
            id: 'prod007',
            nombre: 'Destornillador Set 32pcs',
            descripcion: 'Set profesional de 32 puntas magnéticas con estuche organizador.',
            precio: 34.99,
            stock: 40,
            categoria: 'Herramientas Manuales',
            imagen: 'assets/taladro.avif'
        },
        {
            id: 'prod008',
            nombre: 'Nivel Láser 360°',
            descripcion: 'Nivel láser autonivelante con alcance de 30m y trípode incluido.',
            precio: 89.99,
            stock: 18,
            categoria: 'Medición',
            imagen: 'assets/compresor.jpeg'
        }
    ];

    const DEFAULT_ADMIN = {
        id: 'admin001',
        nombre: 'Administrador',
        email: 'admin@ferreteriacentral.com',
        password: 'admin123',
        telefono: '809-555-0100',
        direccion: 'Santo Domingo, RD',
        rol: 'admin'
    };

    function initData() {
        if (!get(KEYS.PRODUCTS)) {
            set(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
        }

        if (!get(KEYS.USERS)) {
            set(KEYS.USERS, [DEFAULT_ADMIN]);
        } else {
            const users = get(KEYS.USERS);
            if (!users.find(u => u.rol === 'admin')) {
                users.push(DEFAULT_ADMIN);
                set(KEYS.USERS, users);
            }
        }

        if (!get(KEYS.ORDERS)) {
            set(KEYS.ORDERS, []);
        }

        if (!get(KEYS.CART)) {
            set(KEYS.CART, []);
        }
    }

    return {
        KEYS,
        get,
        set,
        generateId,
        initData
    };

})();
