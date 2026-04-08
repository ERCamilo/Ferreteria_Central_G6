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
    const TOPBAR_USER_NAME = document.getElementById('topbarUserName');
    const TOPBAR_USER_AVATAR = document.getElementById('topbarUserAvatar');
    const NOTIFICATION_BADGE = document.getElementById('notificationBadge');

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

            // Inicializar scripts de la vista específica
            initViewScripts(viewName);

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
    // VISTAS DINÁMICAS
    // ===========================
    async function initViewScripts(viewName) {
        if (viewName === 'inicio') {
            await renderInicio();
        } else if (viewName === 'inventario') {
            await renderInventario();
        } else if (viewName === 'registrar-productos') {
            await initRegistrarProductos();
        } else if (viewName === 'pedidos') {
            await renderPedidos();
        } else if (viewName === 'clientes') {
            await renderClientes();
        } else if (viewName === 'ventas') {
            await renderVentas();
        }
    }

    // --- INICIO ---
    async function renderInicio() {
        if (!window.Store) return;

        const orders = await window.Store.getOrders() || [];
        const products = await window.Store.getProducts() || [];
        const ventasCompletadas = orders.filter(o => o.status === 'completado');
        const totalVentas = ventasCompletadas.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const numeroPedidos = orders.length;

        // Clientes desde tabla profiles
        const { data: profiles } = await window.supabase.from('profiles').select('*');
        const numeroClientes = profiles ? profiles.filter(u => u.role !== 'admin').length : 0;

        // Inyectar stats principales
        const ventasEl = document.getElementById('inicioTotalVentas');
        if (ventasEl) ventasEl.textContent = '$' + totalVentas.toLocaleString('es-DO', { minimumFractionDigits: 2 });

        const pedidosEl = document.getElementById('inicioTotalPedidos');
        if (pedidosEl) pedidosEl.textContent = numeroPedidos;

        const clientesEl = document.getElementById('inicioTotalClientes');
        if (clientesEl) clientesEl.textContent = numeroClientes;

        // --- CÁLCULO DE SEMANAS PARA LEYENDA ---
        const now = new Date();
        const startOfThisWeek = new Date(now);
        startOfThisWeek.setDate(now.getDate() - now.getDay()); // Domingo
        startOfThisWeek.setHours(0,0,0,0);

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        const ventasEsteSemana = ventasCompletadas
            .filter(o => new Date(o.fecha) >= startOfThisWeek)
            .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        const ventasSemanaPasada = ventasCompletadas
            .filter(o => {
                const f = new Date(o.fecha);
                return f >= startOfLastWeek && f < startOfThisWeek;
            })
            .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        const vActualEl = document.getElementById('inicioVentasSemanaActual');
        if (vActualEl) vActualEl.textContent = '$' + ventasEsteSemana.toLocaleString('es-DO', { minimumFractionDigits: 2 });

        const vAnteriorEl = document.getElementById('inicioVentasSemanaAnterior');
        if (vAnteriorEl) vAnteriorEl.textContent = '$' + ventasSemanaPasada.toLocaleString('es-DO', { minimumFractionDigits: 2 });

        // Cálculo de tendencia (porcentaje)
        const cambioVentasEl = document.getElementById('inicioCambioVentas');
        if (cambioVentasEl) {
            if (ventasSemanaPasada > 0) {
                const diff = ((ventasEsteSemana - ventasSemanaPasada) / ventasSemanaPasada) * 100;
                cambioVentasEl.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}% vs semana pasada`;
                cambioVentasEl.className = `stat-card__change ${diff >= 0 ? 'positive' : 'negative'}`;
            } else {
                cambioVentasEl.textContent = 'Nueva tendencia';
            }
        }

        // Renderizar gráficos de Inicio
        renderInicioCharts(orders, products);

        // Categorías (conteo real de productos por categoría)
        const catStatsEl = document.getElementById('inicioCategoryStats');
        if (catStatsEl) {
            const counts = {};
            products.forEach(p => {
                const cat = p.categoria || 'Sin Categoría';
                counts[cat] = (counts[cat] || 0) + 1;
            });
            
            catStatsEl.innerHTML = Object.entries(counts).map(([name, count]) => `
                <div class="cat-stat">
                    <p class="cat-stat__value">${count}</p>
                    <span class="cat-stat__label">${name}</span>
                </div>
            `).join('');
        }

        // Top Products (simulado con los primeros 4 del inventario)
        const topProductsBody = document.getElementById('inicioTopProductsBody');
        if (topProductsBody) {
            const topProducts = products.slice(0, 4);
            if (topProducts.length === 0) {
                topProductsBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay productos.</td></tr>';
            } else {
                topProductsBody.innerHTML = topProducts.map(p => `
                    <tr>
                        <td class="product-cell">
                            <span class="product-icon">${p.categoria?.includes('Eléctricas') ? '⚡' : '🔧'}</span>
                            ${p.nombre}
                        </td>
                        <td>Hoy</td>
                        <td>$${parseFloat(p.precio || 0).toFixed(2)}</td>
                        <td>${p.stock}</td>
                        <td>${(p.id || '').substring(0, 8)}</td>
                    </tr>
                `).join('');
            }
        }
    }

    // Estado global de paginación
    window.dashboardPagination = {
        inventario: 1,
        pedidos: 1,
        clientes: 1,
        ventas: 1
    };
    const ITEMS_PER_PAGE = 8; // Elementos por página

    // --- INVENTARIO ---
    async function renderInventario() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        const products = window.Store ? await window.Store.getProducts() : [];
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No hay productos registrados en el inventario.</td></tr>';
            renderPaginationUI(0, 1, ITEMS_PER_PAGE, '.table-pagination', 'inventario');
            return;
        }

        const page = window.dashboardPagination.inventario;
        const totalItems = products.length;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paginatedProducts = products.slice(start, start + ITEMS_PER_PAGE);

        tbody.innerHTML = paginatedProducts.map(p => {
            const stockStatus = p.stock > 10 ? 'success' : (p.stock > 0 ? 'warning' : 'danger');
            const stockText = p.stock > 10 ? 'Disponible' : (p.stock > 0 ? 'Stock Bajo' : 'Agotado');
            // Mock de imagen e icono según si existe
            const imgHtml = p.imagen ? `<img src="${p.imagen.startsWith('http') || p.imagen.startsWith('data:') ? p.imagen : '../' + p.imagen}" style="width:30px; height:30px; object-fit:cover; border-radius:4px; margin-right:10px;">` : `<span class="product-icon product-icon--tool">🔧</span>`;

            return `
                <tr>
                    <td class="product-cell">
                        ${imgHtml}
                        ${p.nombre}
                    </td>
                    <td>${p.categoria}</td>
                    <td>-</td>
                    <td>$${parseFloat(p.precio || 0).toFixed(2)}</td>
                    <td>${p.stock}</td>
                    <td><span class="badge badge--${stockStatus}">${stockText}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn" title="Editar" onclick="editProductDashboard('${p.id}')"><i data-lucide="edit-2"></i></button>
                        <button class="action-btn action-btn--danger" title="Eliminar" onclick="deleteProductDashboard('${p.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        renderPaginationUI(totalItems, page, ITEMS_PER_PAGE, '.table-pagination', 'inventario');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Exponer globalmente para onclick en el HTML inyectado
    window.deleteProductDashboard = function(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) {
            window.Store.deleteProduct(id);
            renderInventario(); // Re-renderizar la tabla tras eliminar
        }
    };

    // Variable global para almacenar pedidos y accederlos desde el modal
    window.adminOrders = [];

    // --- PEDIDOS ---
    async function renderPedidos() {
        const tbody = document.getElementById('adminOrdersTableBody');
        if (!tbody || !window.Store) return;

        window.adminOrders = await window.Store.getOrders();
        const orders = window.adminOrders;
        
        // Actualizar mini-stats
        const pPendientes = orders.filter(o => o.status === 'pendiente').length;
        const pProceso = orders.filter(o => o.status === 'procesando').length;
        const pCompletados = orders.filter(o => o.status === 'completado').length;
        const pRecogida = orders.filter(o => o.type === 'recogida' && o.status !== 'completado').length;

        if (document.getElementById('pedidosPendientes')) document.getElementById('pedidosPendientes').textContent = pPendientes;
        if (document.getElementById('pedidosProceso')) document.getElementById('pedidosProceso').textContent = pProceso;
        if (document.getElementById('pedidosCompletados')) document.getElementById('pedidosCompletados').textContent = pCompletados;
        if (document.getElementById('pedidosRecogida')) document.getElementById('pedidosRecogida').textContent = pRecogida;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">No hay órdenes registradas.</td></tr>';
            renderPaginationUI(0, 1, ITEMS_PER_PAGE, '.table-pagination', 'pedidos');
            return;
        }

        orders.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const page = window.dashboardPagination.pedidos;
        const totalItems = orders.length;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paginatedOrders = orders.slice(start, start + ITEMS_PER_PAGE);

        let rows = '';
        paginatedOrders.forEach(order => {
            const date = new Date(order.fecha).toLocaleDateString();
            
            let clienteName = "Cliente";
            if (order.userId) {
                const user = window.Store.getUserById(order.userId);
                if (user) clienteName = user.nombre;
            }
            
            let badgeClass = 'warning';
            let estadoLabel = 'Pendiente';
            if (order.status === 'completado') { badgeClass = 'success'; estadoLabel = 'Completado'; }
            else if (order.status === 'cancelado') { badgeClass = 'danger'; estadoLabel = 'Cancelado'; }
            else if (order.status === 'procesando') { badgeClass = 'info'; estadoLabel = 'En Proceso'; }

            const deliveryIcon = order.tipoEntrega === 'envio' ? '<i data-lucide="truck"></i> Envío' : '<i data-lucide="store"></i> Recogida';
            const deliveryClass = order.tipoEntrega === 'envio' ? 'shipping' : 'pickup';

            rows += `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${clienteName}</td>
                    <td>${date}</td>
                    <td>$${parseFloat(order.total || 0).toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
                    <td>
                        <span class="delivery-type delivery-type--${deliveryClass}">
                            ${deliveryIcon}
                        </span>
                    </td>
                    <td><span class="badge badge--${badgeClass}">${estadoLabel}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn" title="Ver detalles" onclick="window.viewAdminOrder('${order.id}')"><i data-lucide="eye"></i></button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rows;
        renderPaginationUI(totalItems, page, ITEMS_PER_PAGE, '.table-pagination', 'pedidos');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // --- CLIENTES ---
    async function renderClientes() {
        const tbody = document.getElementById('adminClientesTableBody');
        if (!tbody) return;

        const { data: profiles, error } = await window.supabase.from('profiles').select('*');
        if (error) return;

        const clientes = profiles.filter(u => u.role !== 'admin');

        // Actualizar mini-stats
        if (document.getElementById('clientesTotal')) document.getElementById('clientesTotal').textContent = clientes.length;
        if (document.getElementById('clientesNuevos')) document.getElementById('clientesNuevos').textContent = clientes.length; // Simulado
        if (document.getElementById('clientesRecurrentes')) document.getElementById('clientesRecurrentes').textContent = '0%'; // Simulado

        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">No hay clientes registrados.</td></tr>';
            renderPaginationUI(0, 1, ITEMS_PER_PAGE, '.table-pagination', 'clientes');
            return;
        }

        const orders = await window.Store.getOrders() || [];

        const page = window.dashboardPagination.clientes;
        const totalItems = clientes.length;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paginatedClientes = clientes.slice(start, start + ITEMS_PER_PAGE);

        let rows = '';
        paginatedClientes.forEach(c => {
            // Filtrar órdenes de este cliente
            const userOrders = orders.filter(o => o.userId === c.id);
            const totalGasto = userOrders.filter(o => o.status === 'completado').reduce((sum, o) => sum + o.total, 0);
            const numOrders = userOrders.length;
            
            // Última compra
            let ultimaCompra = '-';
            if (numOrders > 0) {
                const dates = userOrders.map(o => new Date(o.fecha).getTime());
                const lastDate = new Date(Math.max(...dates));
                ultimaCompra = lastDate.toLocaleDateString();
            }

            const initial = c.full_name ? c.full_name.charAt(0).toUpperCase() : 'C';
            rows += `
                <tr>
                    <td class="product-cell">
                        <div class="client-avatar">${initial}</div>
                        ${c.full_name || 'Sin Nombre'}
                    </td>
                    <td>${c.email}</td>
                    <td>${c.phone || '-'}</td>
                    <td><strong>${numOrders}</strong> pedidos</td>
                    <td><strong>$${parseFloat(totalGasto || 0).toLocaleString('es-DO', {minimumFractionDigits: 2})}</strong></td>
                    <td>${ultimaCompra}</td>
                    <td><span class="badge badge--success">Activo</span></td>
                </tr>
            `;
        });
        tbody.innerHTML = rows;
        renderPaginationUI(totalItems, page, ITEMS_PER_PAGE, '.table-pagination', 'clientes');
    }

    // --- VENTAS ---
    async function renderVentas() {
        const tbody = document.getElementById('adminVentasTableBody');
        if (!tbody || !window.Store) return;

        window.adminOrders = await window.Store.getOrders();
        const allOrders = window.adminOrders;
        const sales = allOrders.filter(o => o.status === 'completado');

        // Calcular totales temporales (Hoy, Semana, Mes)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Inicio de semana (Domingo)
        startOfWeek.setHours(0,0,0,0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalHoy = sales.filter(o => new Date(o.fecha) >= startOfDay).reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const totalSemana = sales.filter(o => new Date(o.fecha) >= startOfWeek).reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const totalMes = sales.filter(o => new Date(o.fecha) >= startOfMonth).reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        // Inyectar en UI
        if (document.getElementById('ventasHoy')) document.getElementById('ventasHoy').textContent = '$' + totalHoy.toLocaleString('es-DO', {minimumFractionDigits: 2});
        if (document.getElementById('ventasSemana')) document.getElementById('ventasSemana').textContent = '$' + totalSemana.toLocaleString('es-DO', {minimumFractionDigits: 2});
        if (document.getElementById('ventasMes')) document.getElementById('ventasMes').textContent = '$' + totalMes.toLocaleString('es-DO', {minimumFractionDigits: 2});

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No hay ventas registradas.</td></tr>';
            renderPaginationUI(0, 1, ITEMS_PER_PAGE, '.table-pagination', 'ventas');
            return;
        }

        sales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const page = window.dashboardPagination.ventas;
        const totalItems = sales.length;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paginatedSales = sales.slice(start, start + ITEMS_PER_PAGE);

        let rows = '';
        paginatedSales.forEach(order => {
            const date = new Date(order.fecha).toLocaleDateString();
            let clienteName = "Cliente";
            if (order.userId) {
                const user = window.Store.getUserById(order.userId);
                if (user) clienteName = user.nombre;
            }
            const itemCount = order.items ? order.items.length : 0;

            rows += `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>${clienteName}</td>
                    <td>${itemCount} artículos</td>
                    <td>${date}</td>
                    <td><span class="badge badge--info">${order.metodoPago || 'Tarjeta'}</span></td>
                    <td><strong>$${parseFloat(order.total || 0).toLocaleString('es-DO', {minimumFractionDigits: 2})}</strong></td>
                    <td class="actions-cell">
                        <button class="action-btn" title="Ver detalles" onclick="window.viewAdminOrder('${order.id}')"><i data-lucide="eye"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = rows;
        
        renderPaginationUI(totalItems, page, ITEMS_PER_PAGE, '.table-pagination', 'ventas');

        // Renderizar gráfico de Ventas
        renderVentasCharts(sales);
    }

    // --- MODAL DE DETALLE DE PEDIDOS (ADMIN) ---
    window.viewAdminOrder = function(orderId) {
        if (!window.adminOrders) return;
        const order = window.adminOrders.find(o => o.id === orderId);
        if (!order) return;

        document.getElementById('adminModalOrderId').textContent = '#' + order.id.substring(0,8).toUpperCase();
        document.getElementById('adminModalOrderDate').textContent = 'Fecha: ' + new Date(order.fecha).toLocaleString();
        
        let clienteName = "Cliente";
        if (order.cliente) {
            clienteName = order.cliente;
        } else if (order.userId && window.Store) {
            const user = window.Store.getUserById(order.userId);
            if (user) clienteName = user.nombre;
        }
        document.getElementById('adminModalOrderClient').textContent = 'Cliente: ' + clienteName;

        let itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb;">Producto</th>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb;">Cantidad</th>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb;">Precio Unit.</th>
                        <th style="text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let orderSum = 0;
        if(order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const pName = item.products ? item.products.name : 'Producto Desconocido';
                const sub = item.quantity * item.unit_price;
                orderSum += sub;
                itemsHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${pName}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">$${parseFloat(item.unit_price || 0).toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">$${sub.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
                    </tr>
                `;
            });
        } else {
            itemsHtml += '<tr><td colspan="4" style="text-align:center; padding: 10px;">No hay items.</td></tr>';
        }

        const deliveryCost = order.total - orderSum;
        if(deliveryCost > 0) {
             itemsHtml += `
                 <tr>
                     <td colspan="3" style="text-align:right; padding: 10px;"><strong>Envío:</strong></td>
                     <td style="padding: 10px;"><strong>$${deliveryCost.toLocaleString('es-DO', {minimumFractionDigits: 2})}</strong></td>
                 </tr>
             `;
        }

        itemsHtml += `
                </tbody>
            </table>
            <div style="margin-top: 20px; text-align: right; border-top: 1px solid #e5e7eb; padding-top: 15px;">
                <span style="font-size: 18px; font-weight: bold; color: #0b1838;">Total: $${parseFloat(order.total || 0).toLocaleString('es-DO', {minimumFractionDigits: 2})}</span>
            </div>
        `;

        document.getElementById('adminModalOrderBody').innerHTML = itemsHtml;
        const modal = document.getElementById('adminOrderModal');
        if(modal) modal.style.display = 'flex';
    };

    window.closeAdminOrderModal = function() {
        const modal = document.getElementById('adminOrderModal');
        if(modal) modal.style.display = 'none';
    };

    // Close admin modal on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('adminOrderModal');
        if (event.target == modal) {
            window.closeAdminOrderModal();
        }
    });

    window.editProductDashboard = function(id) {
        window.productToEdit = id;
        navigateTo('registrar-productos');
    };

    async function initRegistrarProductos() {
        const form = document.getElementById('formRegistroProducto');
        if (!form) return;

        let selectedFile = null;
        let currentImageUrl = 'assets/caja-herramientas.jpeg'; // Default
        let isEditing = false;

        // Cargar categorías dinámicamente desde la DB
        const catSelect = document.getElementById('prodCategoria');
        if (catSelect) {
            const { data: categories } = await window.supabase
                .from('categories')
                .select('id, name')
                .order('name');
            
            catSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
            if (categories) {
                categories.forEach(c => {
                    catSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
                });
            }
        }

        // Referencias a UI de imagen
        const fileInput = document.getElementById('prodFoto');
        const imgPreview = document.getElementById('previewImg');
        const previewContainer = document.getElementById('imagePreview');
        const removeBtn = document.getElementById('removePreview');
        const uploadArea = document.getElementById('fileUploadArea');

        // Lógica de llenado si estamos en modo Edición
        if (window.productToEdit) {
            const product = await window.Store.getProductById(window.productToEdit);
            if (product) {
                isEditing = true;
                document.getElementById('prodNombre').value = product.nombre;
                document.getElementById('prodMarca').value = product.marca || '';
                document.getElementById('prodCategoria').value = product.categoria || '';
                document.getElementById('prodSKU').value = product.sku || '';
                document.getElementById('prodPrecio').value = product.precio || '';
                document.getElementById('prodCantidad').value = product.stock || '';
                document.getElementById('prodDescripcion').value = product.descripcion || '';
                
                if (product.imagen) {
                    currentImageUrl = product.imagen;
                    if (imgPreview && previewContainer && uploadArea) {
                        imgPreview.src = product.imagen.startsWith('http') ? product.imagen : `../${product.imagen}`;
                        previewContainer.style.display = 'block';
                        uploadArea.style.display = 'none';
                    }
                }

                // Cambiar texto del botón
                const btnSubmit = form.querySelector('button[type="submit"]');
                if (btnSubmit) {
                    btnSubmit.innerHTML = '<i data-lucide="save"></i> Actualizar Producto';
                }
            }
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btnSubmit = form.querySelector('button[type="submit"]');
            const originalBtnHtml = btnSubmit.innerHTML;
            
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i data-lucide="loader" class="spin"></i> Procesando...';
            lucide.createIcons();

            try {
                // 1. Subir imagen si hay una nueva seleccionada
                let imageUrl = currentImageUrl;
                if (selectedFile) {
                    const uploadedUrl = await window.Store.uploadImage(selectedFile);
                    if (uploadedUrl) imageUrl = uploadedUrl;
                }

                // 2. Recolectar datos
                const formData = {
                    nombre: document.getElementById('prodNombre').value,
                    marca: document.getElementById('prodMarca').value,
                    categoria: document.getElementById('prodCategoria').value,
                    sku: document.getElementById('prodSKU').value,
                    precio: document.getElementById('prodPrecio').value,
                    stock: document.getElementById('prodCantidad').value,
                    descripcion: document.getElementById('prodDescripcion').value,
                    imagen: imageUrl 
                };

                if (window.Store) {
                    if (isEditing) {
                        await window.Store.updateProduct(window.productToEdit, formData);
                        alert('¡Producto actualizado con éxito!');
                        window.productToEdit = null;
                    } else {
                        await window.Store.addProduct(formData);
                        alert('¡Producto registrado con éxito!');
                    }
                    form.reset();
                    navigateTo('inventario');
                }
            } catch (err) {
                console.error(err);
                alert('Error al guardar el producto.');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = originalBtnHtml;
                lucide.createIcons();
            }
        });

        // Al hacer click en volver o limpiar estando en edición, borrar el estado
        form.addEventListener('reset', function() {
             window.productToEdit = null;
        });

        // Configurar visualización de la foto local
        if (fileInput && imgPreview && previewContainer && removeBtn && uploadArea) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    if (file.size > 10 * 1024 * 1024) {
                        alert("La imagen es muy pesada. Máximo 10MB.");
                        this.value = '';
                        return;
                    }

                    selectedFile = file;
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imgPreview.src = e.target.result;
                        previewContainer.style.display = 'block';
                        uploadArea.style.display = 'none';
                    }
                    reader.readAsDataURL(file);
                }
            });

            removeBtn.addEventListener('click', function() {
                fileInput.value = '';
                imgPreview.src = '';
                selectedFile = null;
                previewContainer.style.display = 'none';
                uploadArea.style.display = 'flex';
            });
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
    // LÓGICA DE GRÁFICOS (CHART.JS)
    // ===========================

    function renderInicioCharts(orders, products) {
        const ctxSemana = document.getElementById('ventasSemanaChart');
        const ctxCategorias = document.getElementById('categoriasDonutChart');

        if (ctxSemana && typeof Chart !== 'undefined') {
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('es-DO', { weekday: 'short' });
            });

            // Calcular ventas reales por día para los últimos 7 días
            const salesByDay = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dStr = d.toLocaleDateString();
                return orders
                    .filter(o => o.estado === 'completado' && new Date(o.fecha).toLocaleDateString() === dStr)
                    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
            });

            new Chart(ctxSemana, {
                type: 'bar',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Ventas ($)',
                        data: salesByDay,
                        backgroundColor: '#3b82f6',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        if (ctxCategorias && typeof Chart !== 'undefined') {
            const counts = {};
            products.forEach(p => {
                const cat = p.categoria || 'Sin Categoría';
                counts[cat] = (counts[cat] || 0) + 1;
            });

            new Chart(ctxCategorias, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        data: Object.values(counts),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
                }
            });
        }
    }

    function renderVentasCharts(sales) {
        const ctxTendencia = document.getElementById('tendenciaVentasChart');
        if (ctxTendencia && typeof Chart !== 'undefined') {
            const days = [...Array(15)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (14 - i));
                return d.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
            });

            const dataPoints = [...Array(15)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (14 - i));
                const dStr = d.toLocaleDateString();
                return sales
                    .filter(o => new Date(o.fecha).toLocaleDateString() === dStr)
                    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
            });

            new Chart(ctxTendencia, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Ingresos Diarios',
                        data: dataPoints,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }

    // ===========================
    // UI HELPERS & PAGINATION
    // ===========================

    window.goToPage = function(module, newPage) {
        window.dashboardPagination[module] = newPage;
        if (module === 'inventario') renderInventario();
        if (module === 'pedidos') renderPedidos();
        if (module === 'clientes') renderClientes();
        if (module === 'ventas') renderVentas();
    };

    function renderPaginationUI(totalItems, currentPage, itemsPerPage, containerSelector, module) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Si solo hay 1 página (o cero), ocultamos la paginación por completo
        if (totalPages <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, totalItems);
        
        const infoSpan = container.querySelector('.pagination-info');
        if (infoSpan) infoSpan.textContent = `Mostrando ${start}-${end} de ${totalItems} resultados`;

        const controlsDiv = container.querySelector('.pagination-controls');
        if (!controlsDiv) return;

        let html = '';

        // Prev
        if (currentPage === 1) {
            html += `<button class="pagination-btn" disabled>&laquo;</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="window.goToPage('${module}', ${currentPage - 1})">&laquo;</button>`;
        }

        // Logic for page numbers (show up to 5 buttons: 1, 2, ..., last)
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="window.goToPage('${module}', 1)">1</button>`;
            if (startPage > 2) html += `<span class="pagination-dots">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                html += `<button class="pagination-btn active">${i}</button>`;
            } else {
                html += `<button class="pagination-btn" onclick="window.goToPage('${module}', ${i})">${i}</button>`;
            }
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="pagination-dots">...</span>`;
            html += `<button class="pagination-btn" onclick="window.goToPage('${module}', ${totalPages})">${totalPages}</button>`;
        }

        // Next
        if (currentPage === totalPages) {
            html += `<button class="pagination-btn" disabled>&raquo;</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="window.goToPage('${module}', ${currentPage + 1})">&raquo;</button>`;
        }

        controlsDiv.innerHTML = html;
    }

    function showLoading(show) {
        if (LOADING_SPINNER) {
            LOADING_SPINNER.style.display = show ? 'flex' : 'none';
        }
    }


    /**
     * Actualiza la información del usuario en el topbar
     */
    async function updateTopbarSession() {
        if (!window.Store) return;
        const user = await window.Store.getCurrentUser();
        if (user && TOPBAR_USER_NAME) {
            TOPBAR_USER_NAME.textContent = user.full_name || 'Admin';
            if (TOPBAR_USER_AVATAR) {
                TOPBAR_USER_AVATAR.textContent = (user.full_name || 'A').charAt(0).toUpperCase();
            }
        }
    }

    /**
     * Actualiza el badge de notificaciones (pedidos pendientes)
     */
    async function updateNotificationBadge() {
        if (!window.Store) return;
        const orders = await window.Store.getOrders() || [];
        const pendingCount = orders.filter(o => o.status === 'pendiente').length;
        
        if (NOTIFICATION_BADGE) {
            NOTIFICATION_BADGE.textContent = pendingCount;
            NOTIFICATION_BADGE.style.display = pendingCount > 0 ? 'flex' : 'none';
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

    // --- LOGOUT ---
    window.logoutAdmin = async function(e) {
        if (e) e.preventDefault();
        if (confirm('¿Estás seguro de que deseas cerrar la sesión administrativa?')) {
            if (window.Store) {
                await window.Store.logout();
                window.location.href = 'login.html';
            }
        }
    };

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

    async function init() {
        try {
            // 1. Verificar Sesión y Rol (Seguridad de Base)
            if (!window.Store) throw new Error('Store no inicializado');
            
            const user = await window.Store.getCurrentUser();
            if (!user) {
                console.warn('Acceso no autorizado: Sin sesión activa.');
                window.location.href = 'login.html';
                return;
            }

            if (user.role !== 'admin') {
                console.warn('Acceso denegado: Se requiere rol de administrador.');
                alert('No tienes permisos para acceder al panel administrativo.');
                window.location.href = '../index.html';
                return;
            }

            // 2. Inicializar UI
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Iniciar reloj
            updateDateTime();
            setInterval(updateDateTime, 1000);

            // Actualizar sesión y notificaciones
            await updateTopbarSession();
            await updateNotificationBadge();

            // Cargar vista inicial según el hash de la URL
            const initialView = getViewFromHash();
            setActiveLink(initialView);
            await loadView(initialView);
        } catch (error) {
            console.error('Error durante la inicialización del Dashboard:', error);
            showLoading(false); // Forzar ocultación del spinner si algo falla
        }
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
