/**
 * Servicio de Autenticación y Usuarios
 * Ferretería Central - Grupo 6
 */

window.AuthService = (function (DB) {
    'use strict';

    function getUsers() {
        return DB.get(DB.KEYS.USERS) || [];
    }

    function getUserById(id) {
        return getUsers().find(u => u.id === id) || null;
    }

    function getUserByEmail(email) {
        return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }

    function addUser(userData) {
        const users = getUsers();

        if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, error: 'Este correo ya está registrado.' };
        }

        const newUser = {
            id: DB.generateId(),
            nombre: userData.nombre,
            email: userData.email,
            password: userData.password,
            telefono: userData.telefono || '',
            direccion: userData.direccion || '',
            rol: 'cliente'
        };

        users.push(newUser);
        DB.set(DB.KEYS.USERS, users);
        return { success: true, user: newUser };
    }

    function updateUser(id, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return false;

        // No permitir cambiar el rol ni el id
        delete updates.rol;
        delete updates.id;

        users[index] = { ...users[index], ...updates };
        DB.set(DB.KEYS.USERS, users);

        // Actualizar sesión si es el usuario actual
        const session = getSession();
        if (session && session.id === id) {
            setSession(users[index]);
        }

        return true;
    }

    function getSession() {
        return DB.get(DB.KEYS.SESSION);
    }

    function setSession(user) {
        const sessionData = { ...user };
        delete sessionData.password;
        DB.set(DB.KEYS.SESSION, sessionData);
    }

    function login(email, password) {
        const user = getUserByEmail(email);
        if (!user) {
            return { success: false, error: 'Usuario no encontrado.' };
        }
        if (user.password !== password) {
            return { success: false, error: 'Contraseña incorrecta.' };
        }

        setSession(user);
        return { success: true, user: user };
    }

    function logout() {
        localStorage.removeItem(DB.KEYS.SESSION);
        localStorage.removeItem(DB.KEYS.CART);
    }

    function isLoggedIn() {
        return getSession() !== null;
    }

    function isAdmin() {
        const session = getSession();
        return session && session.rol === 'admin';
    }

    return {
        getUsers,
        getUserById,
        getUserByEmail,
        addUser,
        updateUser,
        getSession,
        login,
        logout,
        isLoggedIn,
        isAdmin
    };

})(window.DB);
