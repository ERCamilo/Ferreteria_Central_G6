/**
 * App.js - Logica de la tienda principal
 * Ferreteria Central - Grupo 6
 *
 * Renderiza dinamicamente los productos y maneja el carrito.
 */

document.addEventListener("DOMContentLoaded", function () {
    const productGrid = document.getElementById("productGrid");
    const cartCountHeader = document.querySelector(".cart-count");
    const productsCountText = document.querySelector(".products-count");
    const searchInput = document.getElementById("searchInput");
    const searchCategory = document.getElementById("searchCategory");
    const searchBtn = document.getElementById("searchBtn");

    let allProducts = [];
    let activeSearchTerm = "";
    let activeCategory = "";
    let productsLoaded = false;

    // ===========================
    // UI UPDATES
    // ===========================

    function updateHeaderCartCount() {
        if (cartCountHeader) {
            cartCountHeader.textContent = Store.getCartCount();
        }
    }

    function updateProductsCount(total) {
        if (productsCountText) {
            productsCountText.innerHTML = `Mostrando <strong>${total}</strong> productos`;
        }
    }

    function normalizeText(value) {
        return (value || "")
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }

    function escapeAttribute(value) {
        return (value || "")
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function matchesCategory(product, selectedCategory) {
        if (!selectedCategory) return true;

        const normalizedCategory = normalizeText(product.categoria);
        const categoryAliases = {
            herramientas: ["herramienta", "manual", "medicion", "precision", "corte"],
            materiales: ["material", "construccion", "cemento", "agregado", "madera"],
            equipos: ["equipo", "almacenamiento", "seguridad", "jardin"],
            electricidad: ["electricidad", "electrica", "electricas", "iluminacion"],
            plomeria: ["plomeria", "tuberia", "bano", "griferia"],
            pintura: ["pintura", "acabado", "sellador"]
        };

        const aliases = categoryAliases[selectedCategory] || [selectedCategory];
        return aliases.some(alias => normalizedCategory.includes(alias));
    }

    function getFilteredProducts(products) {
        const normalizedTerm = normalizeText(activeSearchTerm);

        return products.filter(product => {
            const matchesSearch = !normalizedTerm || [
                product.nombre,
                product.descripcion,
                product.categoria
            ].some(field => normalizeText(field).includes(normalizedTerm));

            return matchesSearch && matchesCategory(product, activeCategory);
        });
    }

    // ===========================
    // RENDERIZADO DE PRODUCTOS
    // ===========================

    async function loadProducts() {
        if (!productsLoaded) {
            allProducts = await Store.getProducts();
            productsLoaded = true;
        }
    }

    async function renderProducts() {
        if (!productGrid) return;

        // Mostrar loader inicial si el grid está vacío
        if (productGrid.innerHTML.trim() === '' || productGrid.innerHTML.includes('Productos cargados dinámicamente')) {
            productGrid.innerHTML = '<div class="loader-container"><i data-lucide="loader" class="spin"></i> Cargando productos...</div>';
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        }

        await loadProducts();
        const cart = Store.getCart();
        const products = getFilteredProducts(allProducts);

        if (products.length === 0) {
            productGrid.innerHTML = '<p class="no-products-message">No se encontraron productos</p>';
            updateProductsCount(0);
            return;
        }

        let html = "";

        products.forEach(product => {
            const cartItem = cart.find(item => item.productId === product.id);
            const inCart = !!cartItem;
            const qty = inCart ? cartItem.cantidad : 0;

            let badgeClass = "badge--manual";
            if (product.categoria.includes("Eléctricas")) badgeClass = "badge--electric";
            if (product.categoria.includes("Almacenamiento")) badgeClass = "badge--storage";
            if (product.categoria.includes("Medición")) badgeClass = "badge--measure";

            let actionHtml = "";

            if (!inCart) {
                actionHtml = `
                    <button class="add-cart-btn block-btn" onclick="appHandleAddToCart('${product.id}')">
                        <i data-lucide="shopping-cart"></i> Agregar
                    </button>
                `;
            } else {
                const minusIcon = qty === 0 ? '<i data-lucide="trash-2" class="text-red"></i>' : "−";
                const minusAction = qty === 0 ? `appHandleRemove('${product.id}')` : `appHandleUpdateQty('${product.id}', -1)`;

                actionHtml = `
                    <div class="uber-qty-controls">
                        <button class="qty-btn ${qty === 0 ? "qty-trash" : ""}" onclick="${minusAction}">
                            ${minusIcon}
                        </button>
                        <span class="qty-display">${qty}</span>
                        <button class="qty-btn" onclick="appHandleUpdateQty('${product.id}', 1)">+</button>
                    </div>
                `;
            }

            html += `
                <article class="store-card" data-product-id="${product.id}" data-name="${escapeAttribute(product.nombre)}" data-category="${escapeAttribute(product.categoria)}">
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
        updateProductsCount(products.length);

        // Re-inicializar iconos
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        updateHeaderCartCount();
    }

    // ===========================
    // ACCIONES GLOBALES
    // ===========================

    window.appHandleAddToCart = function (productId) {
        Store.addToCart(productId, 1);
        renderProducts();
    };

    window.appHandleUpdateQty = function (productId, delta) {
        const cart = Store.getCart();
        const item = cart.find(i => i.productId === productId);

        if (item) {
            const newQty = item.cantidad + delta;
            Store.updateCartQty(productId, newQty);
        }

        renderProducts();
    };

    window.appHandleRemove = function (productId) {
        Store.removeFromCart(productId);
        renderProducts();
    };

    function applyFilters() {
        activeSearchTerm = searchInput ? searchInput.value : "";
        activeCategory = searchCategory ? searchCategory.value : "";
        renderProducts();
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (searchCategory) {
        searchCategory.addEventListener("change", applyFilters);
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", applyFilters);
    }

    renderProducts();
});
