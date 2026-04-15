/**
 * Header Component
 * Ferretería Central - Grupo 6
 * 
 * Este archivo inyecta el Header y Navbar en cualquier página
 * usando el contenedor <div id="app-header" data-base-path="..."></div>
 */

document.addEventListener("DOMContentLoaded", function() {
    const headerContainer = document.getElementById("app-header");
    if (!headerContainer) return;

    // Obtener la ruta base (ej. "./" para index.html o "../" para views/carrito.html)
    const basePath = headerContainer.getAttribute("data-base-path") || "./";

    // No necesitamos viewsPath porque ../views/archivo.html funciona igual de bien
    // desde la carpeta views, subiendo y bajando de nuevo.

    const headerHTML = `
        <!-- TOP HEADER BAR -->
        <header class="top-header">
            <div class="header-inner">

                <!-- Logo -->
                <a href="${basePath}index.html" class="header-logo">
                    <img src="${basePath}assets/logo.png" alt="Ferretería Central" class="header-logo-img">
                    <div class="header-logo-text">
                        <span class="logo-name">Ferretería</span>
                        <span class="logo-sub">Central</span>
                    </div>
                </a>

                <!-- Delivery Info -->
                <div class="header-deliver">
                    <i data-lucide="map-pin"></i>
                    <div>
                        <small>Enviar a</small>
                        <strong>Santo Domingo</strong>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="header-search">
                    <select class="search-category" id="searchCategory">
                        <option value="">Todos</option>
                        <option value="herramientas">Herramientas</option>
                        <option value="materiales">Materiales</option>
                        <option value="equipos">Equipos</option>
                        <option value="electricidad">Electricidad</option>
                        <option value="plomeria">Plomería</option>
                        <option value="pintura">Pintura</option>
                    </select>
                    <input type="text" placeholder="Buscar productos..." class="search-input" id="searchInput">
                    <button class="search-btn" id="searchBtn">
                        <i data-lucide="search"></i>
                    </button>
                </div>

                <!-- Account -->
                <a href="${basePath}login.html" class="header-account" id="headerAccount">
                    <i data-lucide="user"></i>
                    <div class="header-account-info">
                        <small>Hola, Identifícate</small>
                        <strong>Cuenta <i data-lucide="chevron-down"></i></strong>
                    </div>
                </a>

                <!-- Orders -->
                <a href="${basePath}views/perfil.html" class="header-orders">
                    <small>Devoluciones</small>
                    <strong>y Pedidos</strong>
                </a>

                <!-- Cart -->
                <a href="${basePath}views/carrito.html" class="header-cart" id="headerCart">
                    <i data-lucide="shopping-cart"></i>
                    <span class="cart-count" id="cartCountHeader">0</span>
                    <strong>Carrito</strong>
                </a>

            </div>
        </header>

        <!-- NAVIGATION BAR -->
        <nav class="main-nav">
            <div class="nav-inner">
                <div class="nav-links">
                    <button class="nav-menu-btn">
                        <i data-lucide="menu"></i>
                        Todas
                    </button>
                    <a href="${basePath}index.html" class="nav-link active">Inicio</a>
                    <a href="#" class="nav-link">Ofertas Especiales</a>
                    <a href="#" class="nav-link">Lo Más Vendido</a>
                    <a href="#" class="nav-link">Pinturas</a>
                    <a href="#" class="nav-link">Electricidad</a>
                    <a href="#" class="nav-link">Plomería</a>
                </div>
                <div class="nav-promo">
                    <span>Soporte:</span> 809-555-0100
                </div>
            </div>
        </nav>
    `;

    // Inyectar el HTML
    headerContainer.innerHTML = headerHTML;

    // Inicializar iconos de Lucide para los nuevos elementos inyectados
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Actualizar nombre y carrito desde la sesión usando Store.js
    if (typeof Store !== 'undefined') {
        // getSession() es asíncrono (Supabase), por eso usamos .then()
        Store.getSession().then(session => {
            const accountLink = document.getElementById('headerAccount');
            if (session && accountLink) {
                const displayName = (session.full_name || session.email || 'Usuario').split(' ')[0];
                accountLink.innerHTML = `
                    <i data-lucide="user"></i>
                    <div class="header-account-info">
                        <small>Hola, ${displayName}</small>
                        <strong>Mi Cuenta <i data-lucide="chevron-down"></i></strong>
                    </div>
                `;
                accountLink.href = `${basePath}views/perfil.html`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
        
        const cartCountHeader = document.getElementById('cartCountHeader');
        if (cartCountHeader) {
            cartCountHeader.textContent = Store.getCartCount();
        }
    }
});
