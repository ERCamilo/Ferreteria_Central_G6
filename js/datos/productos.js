/**
 * Servicio de Productos — Supabase Edition
 * Ferretería Central - Grupo 6
 */

window.ProductService = (function () {
    'use strict';

    const supabase = window.supabase;

    /**
     * Obtener todos los productos con su categoría
     */
    async function getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)');
        
        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        // Mapear para mantener compatibilidad con el frontend actual
        return data.map(p => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description,
            precio: parseFloat(p.price),
            stock: p.stock,
            categoria: p.categories ? p.categories.name : 'General',
            imagen: p.image_url
        }));
    }

    /**
     * Obtener un producto por ID
     */
    async function getProductById(id) {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('id', id)
            .single();
        
        if (error) return null;

        return {
            id: data.id,
            nombre: data.name,
            descripcion: data.description,
            precio: parseFloat(data.price),
            stock: data.stock,
            categoria: data.categories ? data.categories.name : 'General',
            imagen: data.image_url
        };
    }

    /**
     * Agregar un producto (Solo Admin)
     */
    async function addProduct(productData) {
        // Primero obtener el ID de la categoría por nombre
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', productData.categoria)
            .single();

        const { data, error } = await supabase
            .from('products')
            .insert([{
                name: productData.nombre,
                description: productData.descripcion || '',
                price: parseFloat(productData.precio),
                stock: parseInt(productData.stock),
                category_id: catData ? catData.id : null,
                image_url: productData.imagen || 'assets/default-product.jpg'
            }])
            .select()
            .single();

        if (error) return { success: false, error: error.message };
        return { success: true, product: data };
    }

    /**
     * Actualizar un producto
     */
    async function updateProduct(id, updates) {
        // Mapear campos del frontend a columnas de la DB
        const dbUpdates = {};
        if (updates.nombre) dbUpdates.name = updates.nombre;
        if (updates.descripcion) dbUpdates.description = updates.descripcion;
        if (updates.precio) dbUpdates.price = parseFloat(updates.precio);
        if (updates.stock !== undefined) dbUpdates.stock = parseInt(updates.stock);
        if (updates.imagen) dbUpdates.image_url = updates.imagen;

        // Buscar category_id si se envió una categoría por nombre
        if (updates.categoria) {
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('name', updates.categoria)
                .single();
            
            if (catData) {
                dbUpdates.category_id = catData.id;
            }
        }

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id);

        return !error;
    }

    /**
     * Eliminar un producto
     */
    async function deleteProduct(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        return !error;
    }

    /**
     * Subir imagen a Supabase Storage
     */
    async function uploadImage(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
            .from('products')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    return {
        getProducts,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        uploadImage
    };

})();
