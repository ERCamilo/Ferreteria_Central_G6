document.addEventListener("DOMContentLoaded", function(){

const loginForm = document.getElementById("loginForm");

if(loginForm){
loginForm.addEventListener("submit", function(e){
e.preventDefault();
window.location.href = "dashboard.html";
});
}


});
/*
FUNCIONALIDAD DEL CARRITO DE COMPRAS
Este código permite agregar productos al carrito
y guardar el carrito en el navegador usando localStorage.
*/

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const botonesAgregar = document.querySelectorAll(".add-cart-btn");
const contadorCarrito = document.querySelector(".cart-count");

/*
Si existe contador, muestra la cantidad actual
del carrito al cargar la página
*/
if(contadorCarrito){
contadorCarrito.textContent = carrito.length;
}

botonesAgregar.forEach((boton) => {

boton.addEventListener("click", function(){

const tarjetaProducto = boton.closest(".store-card");

/*
Obtiene los datos del producto desde el HTML
*/
const nombreProducto =
tarjetaProducto.querySelector(".store-card__title").textContent;

const precioProducto =
tarjetaProducto.querySelector(".store-card__price").textContent;

/*
Crea el objeto del producto
*/
const producto = {
nombre: nombreProducto,
precio: precioProducto
};

/*
Agrega el producto al carrito
*/
carrito.push(producto);


/*
Guarda el carrito en el navegador
*/
localStorage.setItem("carrito", JSON.stringify(carrito));


/*
Actualiza el contador visual
*/
contadorCarrito.textContent = carrito.length;


/*
Mensaje simple para el usuario
*/
alert(nombreProducto + " agregado al carrito");

});

});
