# Ferretería Central — Contexto del Proyecto

## Descripción General

**Ferretería Central** es una tienda/ferretería en línea (MVP escolar) donde los clientes pueden explorar un catálogo de herramientas, materiales y equipos de construcción. Los artículos pueden ser **recogidos en tienda** o **enviados a domicilio**.

---

## Información Académica

| Campo       | Detalle                          |
|-------------|----------------------------------|
| Universidad | UAPA                             |
| Asignatura  | Desarrollo de Aplicaciones Web   |
| Período     | Febrero – Abril 2026             |
| Equipo      | Grupo 6 (6 integrantes)          |

---

## Tecnologías

- **HTML5** — Estructura
- **CSS3** — Estilos (Vanilla CSS)
- **JavaScript** — Lógica del cliente
- **Lucide Icons** — Iconografía (CDN)
- **Font Awesome** — Iconos en perfil de usuario
- **localStorage** — Persistencia de datos (etapa actual)
- **Supabase** — Backend / BD (etapa final)
- **GitHub Pages** — Despliegue

---

## Estructura de Archivos

```
Ferreteria_Central_G6/
├── index.html                  ← Tienda / catálogo (página principal)
├── login.html                  ← Login (cliente/admin)
├── dashboard.html              ← Panel admin (SPA)
├── contexto.md                 ← Este documento
├── README.md
├── css/
│   ├── styles.css              ← Estilos generales
│   ├── dashboard.css           ← Estilos del dashboard
│   ├── auth.css                ← Estilos login/registro
│   └── perfil.css              ← Estilos del perfil
├── js/
│   ├── store.js                ← Módulo central de datos (localStorage)
│   ├── app.js                  ← Carrito + lógica tienda
│   └── dashboard.js            ← Router SPA del dashboard
├── views/
│   ├── registro.html           ← Registro de usuario
│   ├── nosotros.html           ← Página "Sobre nosotros"
│   ├── perfil.html             ← Perfil del cliente
│   └── dashboard/              ← Vistas del panel admin
│       ├── inicio.html
│       ├── inventario.html
│       ├── pedidos.html
│       ├── ventas.html
│       ├── clientes.html
│       └── registrar-productos.html
└── assets/
```

---

## Páginas y Características Actuales

### 1. Tienda / Catálogo (`index.html`)
- Header con logo, ubicación de envío, barra de búsqueda con filtro por categoría
- Acceso a cuenta, pedidos y carrito
- Navegación: Inicio, Ofertas, Novedades, Más Vendidos, Herramientas Eléctricas, Manuales
- Promoción de envío gratis en compras +$100
- Grid de **8 productos** con imagen, categoría, título, descripción, precio, stock y botón "Agregar"
- Footer con secciones: Conócenos, Contacto, Síguenos

### 2. Login (`login.html`) + Registro (`views/registro.html`)
- Login con validación contra localStorage (email + contraseña)
- Redirect por rol: admin → dashboard, cliente → index
- Registro: nombre, email, contraseña, teléfono, dirección
- Diseño compartido (card centrada con gradiente)
- Link entre páginas: "¿No tienes cuenta?" / "¿Ya tienes cuenta?"

### 3. Dashboard Administrativo (`dashboard.html`)
- Sidebar + contenido principal con SPA router
- Secciones: Dashboard, Inventario, Pedidos, Ventas, Clientes, Registrar Productos
- Topbar con fecha/hora en tiempo real, notificaciones, avatar admin
- Cache de vistas, transiciones fade, spinner de carga, sidebar responsive

### 4. Nosotros (`views/nosotros.html`)
- Hero con logo, descripción del proyecto, info académica, equipo y tecnologías

### 5. Perfil de Usuario (`views/perfil.html`)
- Tarjeta con foto, nombre, correo, dirección, teléfono
- Sidebar con opciones: Seguridad, Info personal, Formas de pago, Preferencias
- Historial de pedidos y devoluciones en tablas

### 6. Funcionalidad JS
- **Store** (`store.js`): módulo central con CRUD para usuarios, productos, carrito y órdenes
- **Carrito** (`app.js`): agrega productos por ID, feedback visual verde, persiste en localStorage
- **Router SPA** (`dashboard.js`): navega entre vistas con hash, cache, animaciones, reloj
- **Auth**: login/registro contra localStorage, sesiones, usuario admin por defecto

---

## Análisis MVP — Features Faltantes

### ¿Qué falta para un MVP completo?

| # | Feature | Estado | Prioridad |
|---|---------|--------|-----------|
| 1 | **Registro de usuario** | ✅ Hecho | Alta |
| 2 | **Login de usuario** (cliente + admin) | ✅ Hecho | Alta |
| 3 | **Perfil editable** | ✅ Hecho | Alta |
| 4 | **Carrito completo** | ✅ Hecho | Alta |
| 5 | **Página de checkout** | ✅ Hecho | Alta |
| 6 | **Historial de compras** (usuario) | ✅ Hecho | Alta |
| 7 | **Historial de compras** (admin en dashboard) | ✅ Hecho | Media |
| 8 | **CRUD de productos** (admin) | ❌ Parcial | Media |
| 9 | **Productos dinámicos** desde localStorage | ❌ Falta | Media |
| 10 | **Búsqueda funcional** | ❌ Falta | Baja |

### Plan de implementación por fases

**Fase 3 — Todo con localStorage (próximo paso):**
1. Sistema de registro/login de usuario con localStorage
2. Perfil editable que guarda cambios en localStorage
3. Carrito completo: ver, modificar, eliminar, total
4. Checkout simulado: resumen → confirmar → guardar pedido
5. Historial de compras del usuario
6. Vista admin: historial de todos los pedidos
7. CRUD de productos desde el dashboard

**Fase 4 — Migración a backend (etapa final):**
- Reemplazar localStorage por Supabase (autenticación + base de datos)
- Misma lógica, diferentes funciones de almacenamiento

---

## Historial de Cambios

| Fecha       | Cambio                                      |
|-------------|----------------------------------------------|
| 2026-03-21  | Documento de contexto creado                 |
| 2026-03-21  | Reorganización de archivos (Fase 1 completa) |
| 2026-03-21  | Análisis MVP agregado con features faltantes |
| 2026-03-21  | Paso 3A: store.js + auth + carrito funcional |
| 2026-03-21  | Paso 3B: carrito interactivo + página checkout completados |
| 2026-03-21  | Paso 3C: perfil editable, historial usuario y panel pedidos admin completados |
