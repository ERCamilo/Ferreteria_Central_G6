/**
 * Store — Módulo Central de Datos (Facade)
 * Ferretería Central - Grupo 6
 * 
 * Agrupa todos los micro-servicios (Auth, Productos, Carrito, Pedidos)
 * en un solo objeto global Store. De esta forma no se rompe la aplicación actual.
 */

window.Store = Object.assign(
    {},
    window.DB,
    window.ProductService,
    window.AuthService,
    window.CartService,
    window.OrderService
);

// Inicializar datos iniciales por defecto (si el DB está vacío)
if (window.Store && typeof window.Store.initData === 'function') {
    window.Store.initData();
}
