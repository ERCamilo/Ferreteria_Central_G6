/**
 * Servicio de Autenticación y Usuarios — Supabase Edition
 * Ferretería Central - Grupo 6
 */

window.AuthService = (function () {
    'use strict';

    // Helper para obtener el cliente de supabase del objeto global
    const supabase = window.supabase;

    /**
     * Obtiene los datos del perfil de un usuario desde la tabla 'profiles'
     */
    async function getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    }

    /**
     * Registrar un nuevo usuario
     */
    async function addUser(userData) {
        try {
            // 1. Registro en Supabase Auth
            // Pasamos full_name en metadatos para que el trigger lo use
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.nombre
                    }
                }
            });

            if (error) {
                console.error('Registration error:', error);
                let msg = error.message;
                if (error.status === 429) msg = 'Demasiadas solicitudes. Por favor, espera un momento.';
                return { success: false, error: msg };
            }

            // 2. Nota: El perfil se crea automáticamente por el trigger SQL que pusimos antes.
            // Pero si queremos añadir teléfono y dirección ahora:
            if (data.user) {
                await supabase
                    .from('profiles')
                    .update({
                        phone: userData.telefono || '',
                        address: userData.direccion || ''
                    })
                    .eq('id', data.user.id);
            }

            return { success: true, user: data.user };
        } catch (err) {
            console.error('Unexpected registration error:', err);
            return { success: false, error: 'Ocurrió un error inesperado. Revisa tu conexión.' };
        }
    }

    /**
     * Iniciar sesión
     */
    async function login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) return { success: false, error: 'Credenciales inválidas.' };

            // Obtener el perfil extendido (incluyendo el rol)
            const profile = await getProfile(data.user.id);
            
            // Combinar datos del user y del perfil
            const fullUser = {
                id: data.user.id,
                email: data.user.email,
                ...profile
            };

            return { success: true, user: fullUser };
        } catch (err) {
            return { success: false, error: 'Error al conectar con el servidor.' };
        }
    }

    /**
     * Cerrar sesión
     */
    async function logout() {
        await supabase.auth.signOut();
        // Limpiamos carrito local si existiera
        localStorage.removeItem('fc_cart');
    }

    /**
     * Obtener sesión actual (sincronizado con Supabase)
     */
    async function getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const profile = await getProfile(session.user.id);
        return {
            id: session.user.id,
            email: session.user.email,
            ...profile
        };
    }

    /**
     * Verificar si está logueado (atención: asíncrono)
     */
    async function isLoggedIn() {
        const session = await getSession();
        return session !== null;
    }

    /**
     * Verificar si es admin
     */
    async function isAdmin() {
        const session = await getSession();
        return session && session.role === 'admin';
    }

    /**
     * Actualizar datos del perfil
     */
    async function updateUser(id, updates) {
        // No permitir cambiar el rol ni el id desde el cliente
        delete updates.role;
        delete updates.id;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);

        return !error;
    }

    return {
        addUser,
        updateUser,
        getSession,
        getCurrentUser: getSession, // Alias para compatibilidad con Dashboard
        login,
        logout,
        isLoggedIn,
        isAdmin,
        getProfile
    };

})();
