let productos = {};
let totalVenta = 0;
let modoActual = 'papelitos';

const listaProductosVendidos = document.getElementById('lista-productos-vendidos');
const totalPagar = document.getElementById('total-pagar');
const clienteInput = document.getElementById('cliente');
const productoInput = document.getElementById('producto');
const modoVentaBtn = document.getElementById('modo-venta');
const imprimirBtn = document.getElementById('imprimir-btn');

// Función para cargar los productos del archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        productos = data;
        
        console.log('Productos cargados:', productos);
        console.log('¿El objeto de productos está vacío?', Object.keys(productos).length === 0);
        
        actualizarDatalist(modoActual);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

function actualizarDatalist(modo) {

    const datalist = document.getElementById('listaProductos');
    console.log('Elemento datalist encontrado:', datalist);

    if (!datalist) {
        console.error('El elemento <datalist id="listaProductos"> no fue encontrado en el HTML.');
        return;
    }

    datalist.innerHTML = '';

    const productosModo = productos[modo];
    if (productosModo) {
        for (const nombre in productosModo) {
            const option = document.createElement('option');
            option.value = nombre;
            datalist.appendChild(option);
        }
    }
}

// Inicia el proceso de carga
cargarProductos();

function cambiarModoVenta() {
    if (modoActual === 'papelitos') {
        modoActual = 'bebidas_paletas';
        modoVentaBtn.textContent = 'BEBIDAS / PALETAS';
        imprimirBtn.textContent = 'Imprimir Ticket 🖨️';
    } else {
        modoActual = 'papelitos';
        modoVentaBtn.textContent = 'PAPELITOS';
        imprimirBtn.textContent = 'Imprimir 2 Copias 🖨️';
    }
    actualizarDatalist(modoActual);
    listaProductosVendidos.innerHTML = '';
    totalVenta = 0;
    totalPagar.textContent = '$0.00';
    productoInput.value = '';
}

function agregarProducto() {
    const nombreProducto = productoInput.value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precioUnitario = productos[modoActual][nombreProducto];

    if (precioUnitario && cantidad > 0) {
        const precioTotalProducto = precioUnitario * cantidad;

        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `
            <span>${nombreProducto} (${cantidad} x $${precioUnitario.toFixed(2)})</span>
            <span>$${precioTotalProducto.toFixed(2)}</span>
        `;
        listaProductosVendidos.appendChild(div);

        totalVenta += precioTotalProducto;
        totalPagar.textContent = `$${totalVenta.toFixed(2)}`;

        productoInput.value = '';
        document.getElementById('cantidad').value = '1';

    } else {
        alert('❌ Producto no encontrado o cantidad inválida.');
    }
}

function imprimirTickets() {
    const printArea = document.querySelector('.print-area');
    let ticketHTML = '';
    const fechaActual = new Date().toLocaleString();

    if (modoActual === 'papelitos') {
        const ticketContent = document.querySelector('.ticket-box').innerHTML;
        const clienteNombre = clienteInput.value || "Clientes Varios";
        
        const copiaCliente = `
            <div class="print-copy">
                <h3 style="text-align: center;">COPIA CLIENTE</h3>
                <p style="text-align: center;">${fechaActual}</p>
                <p style="text-align: center;">** Gracias por su compra **</p>
                <hr>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                ${ticketContent}
            </div>
        `;
        
        const copiaCaja = `
            <div class="print-copy">
                <h3 style="text-align: center;">COPIA CAJA</h3>
                <p style="text-align: center;">${fechaActual}</p>
                <p style="text-align: center;">** Registro Interno **</p>
                <hr>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                ${ticketContent}
            </div>
        `;
        ticketHTML = copiaCliente + copiaCaja;

    } else if (modoActual === 'bebidas_paletas') {
        const items = listaProductosVendidos.querySelectorAll('.item-row');
        let itemsText = '';
        items.forEach(item => {
            itemsText += `<p class="ticket-simple">${item.firstElementChild.textContent.trim()} ${item.lastElementChild.textContent.trim()}</p>`;
        });

        const totalText = totalPagar.textContent;
        ticketHTML = `
            <div class="ticket-simple">
                <p>${fechaActual}</p>
                ${itemsText}
                <p>-------------------------</p>
                <p>Total:      ${totalText}</p>
            </div>
        `;
    }
    
    printArea.innerHTML = ticketHTML;
    
    window.print();
}
