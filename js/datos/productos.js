/**
 * Servicio de Productos
 * Ferretería Central - Grupo 6
 */

window.ProductService = (function (DB) {
    'use strict';

    function getProducts() {
        return DB.get(DB.KEYS.PRODUCTS) || [];
    }

    function getProductById(id) {
        return getProducts().find(p => p.id === id) || null;
    }

    function addProduct(productData) {
        const products = getProducts();
        const newProduct = {
            id: DB.generateId(),
            nombre: productData.nombre,
            descripcion: productData.descripcion || '',
            precio: parseFloat(productData.precio),
            stock: parseInt(productData.stock),
            categoria: productData.categoria || 'General',
            imagen: productData.imagen || 'assets/compresor.jpeg'
        };

        products.push(newProduct);
        DB.set(DB.KEYS.PRODUCTS, products);
        return newProduct;
    }

    function updateProduct(id, updates) {
        const products = getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return false;

        products[index] = { ...products[index], ...updates };
        DB.set(DB.KEYS.PRODUCTS, products);
        return true;
    }

    function deleteProduct(id) {
        const products = getProducts().filter(p => p.id !== id);
        DB.set(DB.KEYS.PRODUCTS, products);
        return true;
    }

    return {
        getProducts,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct
    };

})(window.DB);
