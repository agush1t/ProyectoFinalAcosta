// =========================
// CLASE
// =========================
class Producto {
    constructor(id, nombre, precio) {
        this.id = id
        this.nombre = nombre
        this.precio = precio
    }
}

// =========================
// VARIABLES GLOBALES
// =========================
let productos = []
let carrito = JSON.parse(localStorage.getItem("carrito")) || []
let historialCompras = JSON.parse(localStorage.getItem("historialCompras")) || []

const formUsuario = document.getElementById("formUsuario")
const mensaje = document.getElementById("mensaje")
const catalogo = document.getElementById("catalogo")
const contenedorProductos = document.getElementById("contenedorProductos")
const listaCarrito = document.getElementById("listaCarrito")
const totalElemento = document.getElementById("total")
const botonVaciar = document.getElementById("vaciarCarrito")
const botonFinalizar = document.getElementById("finalizarCompra")
const mensajeCompra = document.getElementById("mensajeCompra")
const contenedorHistorial = document.getElementById("historialCompras")

// =========================
// CARGAR USUARIO SI EXISTE
// =========================
const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"))

if (usuarioGuardado) {
    mensaje.innerText = `Bienvenido nuevamente ${usuarioGuardado.nombre}`
    catalogo.style.display = "block"
}

// =========================
// CARGAR PRODUCTOS DESDE JSON
// =========================
fetch("./data/productos.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo de productos.")
        }
        return response.json()
    })
    .then(data => {
        productos = data.map(producto => new Producto(producto.id, producto.nombre, producto.precio))
        renderProductos()
    })
    .catch(error => {
        mensajeCompra.innerText = "Error al cargar los productos."
        Swal.fire({
            icon: "error",
            title: "Error de carga",
            text: "No se pudo cargar el catálogo de productos."
        })
        console.error(error)
    })

// =========================
// LOGIN
// =========================
formUsuario.addEventListener("submit", (e) => {
    e.preventDefault()

    const nombre = document.getElementById("nombre").value.trim()
    const edad = Number(document.getElementById("edad").value)

    if (nombre === "" || edad <= 0 || isNaN(edad)) {
        mensaje.innerText = "Ingrese datos válidos"
        Swal.fire({
            icon: "warning",
            title: "Datos inválidos",
            text: "Completá correctamente nombre y edad."
        })
        return
    }

    if (edad < 18) {
        mensaje.innerText = "Debes ser mayor de 18 años"
        Swal.fire({
            icon: "warning",
            title: "Acceso denegado",
            text: "Debes ser mayor de 18 años para ingresar."
        })
        return
    }

    localStorage.setItem("usuario", JSON.stringify({ nombre, edad }))

    mensaje.innerText = `Bienvenido ${nombre}`
    catalogo.style.display = "block"

    Swal.fire({
        icon: "success",
        title: `Bienvenido ${nombre}`,
        text: "Ya podés ver el catálogo y comprar productos."
    })
})

// =========================
// RENDER PRODUCTOS
// =========================
function renderProductos() {
    contenedorProductos.innerHTML = ""

    productos.forEach(producto => {
        const div = document.createElement("div")
        div.className = "producto-card"

        div.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio}</p>
            <button data-id="${producto.id}">Agregar al carrito</button>
        `

        contenedorProductos.appendChild(div)
    })

    const botonesAgregar = contenedorProductos.querySelectorAll("button")

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = Number(boton.dataset.id)
            agregarAlCarrito(id)
        })
    })
}

// =========================
// AGREGAR AL CARRITO
// =========================
function agregarAlCarrito(id) {
    const productoEncontrado = productos.find(producto => producto.id === id)

    if (!productoEncontrado) {
        Swal.fire({
            icon: "error",
            title: "Producto no encontrado",
            text: "No se pudo agregar el producto seleccionado."
        })
        return
    }

    const productoEnCarrito = carrito.find(producto => producto.id === id)

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1
    } else {
        carrito.push({
            id: productoEncontrado.id,
            nombre: productoEncontrado.nombre,
            precio: productoEncontrado.precio,
            cantidad: 1
        })
    }

    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderCarrito()

    Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `${productoEncontrado.nombre} se agregó al carrito.`,
        timer: 1200,
        showConfirmButton: false
    })
}

// =========================
// RENDER CARRITO
// =========================
function renderCarrito() {
    listaCarrito.innerHTML = ""

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<li>El carrito está vacío.</li>"
        calcularTotal()
        return
    }

    carrito.forEach(producto => {
        const li = document.createElement("li")
        li.innerHTML = `
            <strong>${producto.nombre}</strong> - $${producto.precio} x ${producto.cantidad}
            <button data-id="${producto.id}" class="btn-eliminar">❌</button>
        `
        listaCarrito.appendChild(li)
    })

    const botonesEliminar = listaCarrito.querySelectorAll(".btn-eliminar")

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = Number(boton.dataset.id)
            eliminarProducto(id)
        })
    })

    calcularTotal()
}

// =========================
// ELIMINAR PRODUCTO POR ID
// =========================
function eliminarProducto(id) {
    const productoAEliminar = carrito.find(producto => producto.id === id)

    carrito = carrito.filter(producto => producto.id !== id)
    localStorage.setItem("carrito", JSON.stringify(carrito))
    renderCarrito()

    if (productoAEliminar) {
        Swal.fire({
            icon: "info",
            title: "Producto eliminado",
            text: `${productoAEliminar.nombre} fue eliminado del carrito.`,
            timer: 1200,
            showConfirmButton: false
        })
    }
}

// =========================
// VACIAR CARRITO
// =========================
botonVaciar.addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Carrito vacío",
            text: "No hay productos para eliminar."
        })
        return
    }

    carrito = []
    localStorage.removeItem("carrito")
    renderCarrito()

    Swal.fire({
        icon: "success",
        title: "Carrito vaciado",
        text: "Se eliminaron todos los productos del carrito."
    })
})

// =========================
// CALCULAR TOTAL
// =========================
function calcularTotal() {
    const total = carrito.reduce((acumulador, producto) => {
        return acumulador + (producto.precio * producto.cantidad)
    }, 0)

    totalElemento.innerText = `Total: $${total}`
}

// =========================
// FINALIZAR COMPRA
// =========================
botonFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) {
        mensajeCompra.innerText = "El carrito está vacío"
        Swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "Agregá productos antes de finalizar la compra."
        })
        return
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"))

    if (!usuario) {
        mensajeCompra.innerText = "Debe iniciar sesión"
        Swal.fire({
            icon: "warning",
            title: "Iniciá sesión",
            text: "Debés ingresar tus datos antes de comprar."
        })
        return
    }

    const total = carrito.reduce((acumulador, producto) => {
        return acumulador + (producto.precio * producto.cantidad)
    }, 0)

    const orden = {
        id: Date.now(),
        cliente: usuario.nombre,
        productos: [...carrito],
        total: total,
        fecha: new Date().toLocaleDateString()
    }

    historialCompras.push(orden)
    localStorage.setItem("historialCompras", JSON.stringify(historialCompras))

    carrito = []
    localStorage.removeItem("carrito")
    renderCarrito()
    renderHistorial()

    mensajeCompra.innerHTML = `
        ✅ Compra realizada con éxito <br>
        Número de orden: ${orden.id} <br>
        Total abonado: $${orden.total}
    `

    Swal.fire({
        icon: "success",
        title: "Compra realizada",
        html: `
            <p>Tu compra fue registrada correctamente.</p>
            <p><strong>Orden:</strong> ${orden.id}</p>
            <p><strong>Total:</strong> $${orden.total}</p>
        `
    })
})

// =========================
// RENDER HISTORIAL DE COMPRAS
// =========================
function renderHistorial() {
    if (!contenedorHistorial) return

    contenedorHistorial.innerHTML = ""

    if (historialCompras.length === 0) {
        contenedorHistorial.innerHTML = "<p>Todavía no hay compras registradas.</p>"
        return
    }

    historialCompras.forEach(orden => {
        const div = document.createElement("div")
        div.className = "orden-card"

        const productosTexto = orden.productos
            .map(producto => `${producto.nombre} x ${producto.cantidad}`)
            .join(", ")

        div.innerHTML = `
            <p><strong>Orden:</strong> ${orden.id}</p>
            <p><strong>Cliente:</strong> ${orden.cliente}</p>
            <p><strong>Fecha:</strong> ${orden.fecha}</p>
            <p><strong>Productos:</strong> ${productosTexto}</p>
            <p><strong>Total:</strong> $${orden.total}</p>
        `

        contenedorHistorial.appendChild(div)
    })
}

// =========================
// INICIALIZACIÓN
// =========================
renderCarrito()
renderHistorial()