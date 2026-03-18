let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const contenedor = document.getElementById("carrito-container");
const totalElemento = document.getElementById("total");

function mostrarCarrito(){

contenedor.innerHTML = "";

let total = 0;

carrito.forEach((producto, index) => {

let precio = parseFloat(producto.precio.replace("$",""));

let subtotal = precio;

total += subtotal;

contenedor.innerHTML += `

<div class="cart-item">

<h3>${producto.nombre}</h3>

<p>Precio: ${producto.precio}</p>

<p>Subtotal: $${subtotal.toFixed(2)}</p>

<button onclick="eliminarProducto(${index})">
Eliminar
</button>

</div>

<hr>

`;

});

totalElemento.textContent = total.toFixed(2);

}

function eliminarProducto(index){

carrito.splice(index,1);

localStorage.setItem("carrito", JSON.stringify(carrito));

mostrarCarrito();

}

function vaciarCarrito(){

localStorage.removeItem("carrito");

carrito = [];

mostrarCarrito();

}

mostrarCarrito();
