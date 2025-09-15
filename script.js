let productos = {};
let totalVenta = 0;
let modoActual = 'papelitos';

const listaProductosVendidos = document.getElementById('lista-productos-vendidos');
const totalPagar = document.getElementById('total-pagar');
const clienteInput = document.getElementById('cliente');
const productoInput = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');
const imprimirBtn = document.getElementById('imprimir-btn');

// Nuevos elementos para cotizaciones
const ventaInputsContainer = document.getElementById('venta-inputs');
const cotizacionInputsContainer = document.getElementById('cotizacion-inputs');
const cotizacionDescripcionInput = document.getElementById('cotizacion-descripcion');
const cotizacionPrecioInput = document.getElementById('cotizacion-precio');
const listaCotizacionesItems = document.getElementById('lista-cotizaciones-items');

// Función para cargar los productos del archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        productos = data;
        
        console.log('Productos cargados:', productos);
        actualizarDatalist(modoActual);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

function actualizarDatalist(modo) {
    const datalist = document.getElementById('listaProductos');

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

function setModoVenta(modo) {
    modoActual = modo;
    
    // Resaltar el botón activo
    document.querySelectorAll('.switch-container button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${modo}`).classList.add('active');

    // Ocultar/mostrar los campos de entrada según el modo
    if (modo === 'cotizaciones') {
        ventaInputsContainer.style.display = 'none';
        cotizacionInputsContainer.style.display = 'block';
        imprimirBtn.textContent = 'Imprimir Cotización 🖨️';
    } else {
        ventaInputsContainer.style.display = 'block';
        cotizacionInputsContainer.style.display = 'none';
        imprimirBtn.textContent = (modo === 'papelitos' ? 'Imprimir 2 Copias 🖨️' : 'Imprimir Ticket 🖨️');
        actualizarDatalist(modo);
    }

    // Limpiar listas y campos
    listaProductosVendidos.innerHTML = '';
    listaCotizacionesItems.innerHTML = '';
    totalVenta = 0;
    totalPagar.textContent = '$0.00';
    productoInput.value = '';
    cotizacionDescripcionInput.value = '';
    cotizacionPrecioInput.value = '';
    clienteInput.value = '';
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

function agregarACotizacion() {
    const descripcion = cotizacionDescripcionInput.value;
    const precio = parseFloat(cotizacionPrecioInput.value);

    if (!descripcion || isNaN(precio)) {
        alert('❌ Por favor, ingrese una descripción y un precio válido.');
        return;
    }

    if (listaCotizacionesItems.children.length >= 3) {
        alert('❌ No se pueden agregar más de 3 items a la cotización.');
        return;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-row';
    itemDiv.innerHTML = `
        <span>${descripcion}</span>
        <span>$${precio.toFixed(2)}</span>
    `;
    listaCotizacionesItems.appendChild(itemDiv);

    cotizacionDescripcionInput.value = '';
    cotizacionPrecioInput.value = '';
}

function imprimirTickets() {
    const printArea = document.querySelector('.print-area');
    let ticketHTML = '';
    const fechaActual = new Date().toLocaleString();
    const encabezadoComun = `
        <h3 style="text-align: center;">AGROSERVICIO Y FERRETERIA BUJAIDA</h3>
        <p style="text-align: center;">Sucursal Desvío a San Pedro Nonualco</p>
        <p style="text-align: center;">Teléfono y Whatsapp 7296-9007</p>
        <hr>
    `;

    if (modoActual === 'cotizaciones') {
        const items = listaCotizacionesItems.querySelectorAll('.item-row');

        if (items.length === 0) {
            alert('❌ No hay items para cotizar. Por favor, agregue al menos uno.');
            return;
        }

        let itemsHTML = '';
        items.forEach(item => {
            const descripcion = item.querySelector('span:first-child').textContent;
            const precio = item.querySelector('span:last-child').textContent;
            itemsHTML += `<p style="text-align: center;">- Precio: ${precio} - ${descripcion}</p>`;
        });

        ticketHTML = `
            <div class="print-copy">
                <h3 style="text-align: center;">COTIZACIÓN</h3>
                <p style="text-align: center;">${fechaActual}</p>
                <p style="text-align: center;">AGROSERVICIO Y FERRETERIA BUJAIDA</p>
                <p style="text-align: center;">SUC. DESVÍO A SAN PEDRO NONUALCO</p>
                <p style="text-align: center;">TEL.:  7296-9007</p>
                ${itemsHTML}
            </div>
        `;
    } else if (modoActual === 'papelitos') {
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
                <p>Total:     ${totalText}</p>
            </div>
        `;
    }
    
    printArea.innerHTML = ticketHTML;
    
    window.print();
}
