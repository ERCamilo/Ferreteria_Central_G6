/**
 * App.js — Lógica de la tienda principal
 * Ferretería Central - Grupo 6
 * 
 * Renderiza dinámicamente los productos y maneja el carrito (estilo Uber-Eats)
 */

document.addEventListener("DOMContentLoaded", function() {

    const productGrid = document.getElementById("productGrid");
    const cartCountHeader = document.querySelector(".cart-count");

    // ===========================
    // UI UPDATES
    // ===========================

    function updateHeaderCartCount() {
        if (cartCountHeader) {
            cartCountHeader.textContent = Store.getCartCount();
        }
    }

    // ===========================
    // RENDERIZADO DE PRODUCTOS
    // ===========================

    async function renderProducts() {
        if (!productGrid) return; 
        
        // Mostrar loader inicial si el grid está vacío
        if (productGrid.innerHTML === '') {
            productGrid.innerHTML = '<div class="loader-container"><i data-lucide="loader" class="spin"></i> Cargando productos...</div>';
            lucide.createIcons();
        }

        const products = await Store.getProducts();
        const cart = Store.getCart();

        let html = '';
        // ... (resto de la lógica igual, pero con los datos de Supabase)

        products.forEach(product => {
            // Check if product is in cart
            const cartItem = cart.find(item => item.productId === product.id);
            const inCart = !!cartItem;
            const qty = inCart ? cartItem.cantidad : 0;

            // Etiqueta de clase css según categoría para el color
            let badgeClass = 'badge--manual';
            if (product.categoria.includes('Eléctricas')) badgeClass = 'badge--electric';
            if (product.categoria.includes('Almacenamiento')) badgeClass = 'badge--storage';
            if (product.categoria.includes('Medición')) badgeClass = 'badge--measure';

            // Generar el botón de acción (Agregar vs Controles Uber-Eats)
            let actionHtml = '';
            
            if (!inCart) {
                // Estado 1: No está en el carrito
                actionHtml = `
                    <button class="add-cart-btn block-btn" onclick="appHandleAddToCart('${product.id}')">
                        <i data-lucide="shopping-cart"></i> Agregar
                    </button>
                `;
            } else {
                // Estado 2: Está en el carrito (controles de cantidad)
                // Si la cantidad es 0, el botón de resta se convierte en un basurero rojo
                const minusIcon = qty === 0 ? '<i data-lucide="trash-2" class="text-red"></i>' : '−';
                const minusAction = qty === 0 ? `appHandleRemove('${product.id}')` : `appHandleUpdateQty('${product.id}', -1)`;

                actionHtml = `
                    <div class="uber-qty-controls">
                        <button class="qty-btn ${qty === 0 ? 'qty-trash' : ''}" onclick="${minusAction}">
                            ${minusIcon}
                        </button>
                        <span class="qty-display">${qty}</span>
                        <button class="qty-btn" onclick="appHandleUpdateQty('${product.id}', 1)">+</button>
                    </div>
                `;
            }

            html += `
                <article class="store-card" data-product-id="${product.id}">
                    <div class="store-card__image">
                        <span class="category-badge ${badgeClass}">${product.categoria}</span>
                        <img src="${product.imagen}" alt="${product.nombre}" loading="lazy">
                    </div>
                    <div class="store-card__body">
                        <h3 class="store-card__title">${product.nombre}</h3>
                        <p class="store-card__desc">${product.descripcion}</p>
                        <div class="store-card__footer">
                            <div class="store-card__pricing">
                                <span class="store-card__price">$${product.precio.toFixed(2)}</span>
                                <small class="store-card__stock">${product.stock} disponibles</small>
                            </div>
                            <div class="store-card__action">
                                ${actionHtml}
                            </div>
                        </div>
                    </div>
                </article>
            `;
        });

        productGrid.innerHTML = html;
        
        // Re-inicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        updateHeaderCartCount();
    }

    // ===========================
    // ACCIONES GLOBALES (Window Exp)
    // ===========================

    window.appHandleAddToCart = function(productId) {
        Store.addToCart(productId, 1);
        renderProducts(); // Re-render para mostrar los controles Uber-Eats
    };

    window.appHandleUpdateQty = function(productId, delta) {
        const cart = Store.getCart();
        const item = cart.find(i => i.productId === productId);
        if (item) {
            const newQty = item.cantidad + delta;
            // No eliminamos si baja a 0, solo actualizamos (Store ya permite 0)
            Store.updateCartQty(productId, newQty);
        }
        renderProducts();
    };

    window.appHandleRemove = function(productId) {
        Store.removeFromCart(productId);
        renderProducts();
    };

    // Inicializar la vista
    renderProducts();

});
