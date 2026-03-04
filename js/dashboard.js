/**
 * Dashboard SPA Router
 * Ferretería Central - Grupo 6
 * 
 * Maneja la navegación del dashboard cargando vistas dinámicamente
 * desde la carpeta views/ e inyectándolas en #content.
 */

(function () {
    'use strict';

    // ===========================
    // CONFIGURACIÓN
    // ===========================
    const VIEWS_PATH = 'views/dashboard/';
    const DEFAULT_VIEW = 'inicio';
    const CONTENT_EL = document.getElementById('content');
    const SIDEBAR_NAV = document.getElementById('sidebarNav');
    const LOADING_SPINNER = document.getElementById('loadingSpinner');
    const SIDEBAR = document.getElementById('sidebar');
    const SIDEBAR_TOGGLE = document.getElementById('sidebarToggle');
    const VIEW_TITLE = document.getElementById('viewTitle');
    const CURRENT_DATE = document.getElementById('currentDate');
    const CURRENT_TIME = document.getElementById('currentTime');

    // Cache de vistas cargadas (evita fetch repetidos)
    const viewCache = {};

    // Mapa de nombres de vistas a títulos legibles
    const VIEW_TITLES = {
        'inicio': 'Dashboard',
        'inventario': 'Inventario',
        'pedidos': 'Pedidos',
        'ventas': 'Ventas',
        'clientes': 'Clientes',
        'registrar-productos': 'Registrar Productos'
    };

    // ===========================
    // CARGADOR DE VISTAS
    // ===========================

    /**
     * Carga una vista desde views/{name}.html y la inyecta en #content
     * @param {string} viewName - Nombre de la vista (sin extensión)
     */
    async function loadView(viewName) {
        // Mostrar spinner
        showLoading(true);

        // Verificar si está en cache
        if (viewCache[viewName]) {
            renderView(viewName, viewCache[viewName]);
            return;
        }

        try {
            const response = await fetch(`${VIEWS_PATH}${viewName}.html`);

            if (!response.ok) {
                throw new Error(`Vista "${viewName}" no encontrada (${response.status})`);
            }

            const html = await response.text();
            viewCache[viewName] = html; // Guardar en cache
            renderView(viewName, html);

        } catch (error) {
            console.error('Error cargando vista:', error);
            renderError(viewName);
        }
    }

    /**
     * Renderiza el HTML de la vista en #content con animación
     */
    function renderView(viewName, html) {
        // Fade out
        CONTENT_EL.classList.add('fade-out');

        setTimeout(() => {
            CONTENT_EL.innerHTML = html;
            showLoading(false);

            // Fade in
            CONTENT_EL.classList.remove('fade-out');
            CONTENT_EL.classList.add('fade-in');

            setTimeout(() => {
                CONTENT_EL.classList.remove('fade-in');
            }, 300);

            // Re-inicializar iconos de Lucide en el nuevo contenido
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Actualizar el título de la página
            updatePageTitle(viewName);

        }, 150); // Duración del fade-out
    }

    /**
     * Muestra un mensaje de error si la vista no se puede cargar
     */
    function renderError(viewName) {
        showLoading(false);
        CONTENT_EL.innerHTML = `
            <div class="view-error">
                <i data-lucide="alert-triangle"></i>
                <h2>Sección no disponible</h2>
                <p>La sección "<strong>${viewName}</strong>" aún no está disponible o no se pudo cargar.</p>
                <button class="btn-primary" onclick="window.location.hash = '#inicio'">
                    Volver al Inicio
                </button>
            </div>
        `;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // ===========================
    // NAVEGACIÓN
    // ===========================

    /**
     * Marca el link activo en el sidebar
     */
    function setActiveLink(viewName) {
        const links = SIDEBAR_NAV.querySelectorAll('a[data-view]');
        links.forEach(link => {
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Actualiza el título de la pestaña y el topbar
     */
    function updatePageTitle(viewName) {
        const title = VIEW_TITLES[viewName] || viewName;
        document.title = `${title} | Ferretería Central`;
        if (VIEW_TITLE) {
            VIEW_TITLE.textContent = title;
        }
    }

    // ===========================
    // RELOJ EN TIEMPO REAL
    // ===========================

    function updateDateTime() {
        const now = new Date();

        // Fecha: "Mar 04, 2026" format
        const dateOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
        if (CURRENT_DATE) {
            CURRENT_DATE.textContent = now.toLocaleDateString('es-DO', dateOptions);
        }

        // Hora: "02:33 PM"
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        if (CURRENT_TIME) {
            CURRENT_TIME.textContent = now.toLocaleTimeString('es-DO', timeOptions);
        }
    }

    /**
     * Obtiene el nombre de la vista desde el hash de la URL
     */
    function getViewFromHash() {
        const hash = window.location.hash.replace('#', '');
        return hash || DEFAULT_VIEW;
    }

    /**
     * Navega a una vista
     */
    function navigateTo(viewName) {
        window.location.hash = `#${viewName}`;
    }

    // ===========================
    // UI HELPERS
    // ===========================

    function showLoading(show) {
        if (LOADING_SPINNER) {
            LOADING_SPINNER.style.display = show ? 'flex' : 'none';
        }
    }

    // ===========================
    // SIDEBAR TOGGLE (MÓVIL)
    // ===========================

    function toggleSidebar() {
        SIDEBAR.classList.toggle('sidebar--open');
    }

    function closeSidebar() {
        SIDEBAR.classList.remove('sidebar--open');
    }

    // ===========================
    // EVENT LISTENERS
    // ===========================

    // Clicks en links del sidebar
    SIDEBAR_NAV.addEventListener('click', function (e) {
        const link = e.target.closest('a[data-view]');
        if (!link) return;

        e.preventDefault();
        const viewName = link.dataset.view;
        navigateTo(viewName);

        // En móvil, cerrar sidebar al navegar
        closeSidebar();
    });

    // Cambio de hash (navegación atrás/adelante del navegador)
    window.addEventListener('hashchange', function () {
        const view = getViewFromHash();
        setActiveLink(view);
        loadView(view);
    });

    // Toggle sidebar en móvil
    if (SIDEBAR_TOGGLE) {
        SIDEBAR_TOGGLE.addEventListener('click', toggleSidebar);
    }

    // Cerrar sidebar al hacer clic fuera (móvil)
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768 &&
            SIDEBAR.classList.contains('sidebar--open') &&
            !SIDEBAR.contains(e.target) &&
            e.target !== SIDEBAR_TOGGLE &&
            !SIDEBAR_TOGGLE.contains(e.target)) {
            closeSidebar();
        }
    });

    // ===========================
    // INICIALIZACIÓN
    // ===========================

    function init() {
        // Inicializar iconos de Lucide (sidebar + topbar)
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Iniciar reloj
        updateDateTime();
        setInterval(updateDateTime, 1000);

        // Cargar vista inicial según el hash de la URL
        const initialView = getViewFromHash();
        setActiveLink(initialView);
        loadView(initialView);
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
