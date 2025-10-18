let productos = {};
let totalVenta = 0;
let modoActual = 'papelitos';

const listaProductosVendidos = document.getElementById('lista-productos-vendidos');
const totalPagar = document.getElementById('total-pagar');
const clienteInput = document.getElementById('cliente');
const productoInput = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');

// Elementos para Venta/Cotizaciones
const ventaInputsContainer = document.getElementById('venta-inputs');
const cotizacionInputsContainer = document.getElementById('cotizacion-inputs');
const cotizacionDescripcionInput = document.getElementById('cotizacion-descripcion');
const cotizacionPrecioInput = document.getElementById('cotizacion-precio');
const listaCotizacionesItems = document.getElementById('lista-cotizaciones-items');
const imprimirBtnVenta = document.getElementById('imprimir-btn-venta');
const imprimirBtnCotizacion = document.getElementById('imprimir-btn-cotizacion');


// NUEVOS elementos para RESERVAS DE POLLITOS
const reservaInputsContainer = document.getElementById('reserva-inputs');
const clienteReservaInput = document.getElementById('cliente-reserva');
const pollitoTipoSelect = document.getElementById('pollito-tipo');
const cantidadReservaInput = document.getElementById('cantidad-reserva');
const fechaEntregaInput = document.getElementById('fecha-entrega');
const abonoReservaInput = document.getElementById('abono-reserva');
const totalReservaSpan = document.getElementById('total-reserva');
const restaReservaSpan = document.getElementById('resta-reserva');
const detalleReservaItemDiv = document.getElementById('detalle-reserva-item');

let reservaActual = {
    tipo: '',
    cantidad: 0,
    precioUnitario: 0,
    total: 0,
    abono: 0,
    resta: 0,
    fechaEntrega: ''
};

// Función para cargar los productos del archivo JSON
async function cargarProductos() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        productos = data;
        
        console.log('Productos cargados:', productos);
        actualizarDatalist(modoActual);
        actualizarSelectPollitos(); 
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

// NUEVA FUNCIÓN: Llenar el select de pollitos
function actualizarSelectPollitos() {
    const select = pollitoTipoSelect;
    select.innerHTML = '<option value="">-- Seleccione el tipo de pollito --</option>';

    if (productos['pollitos']) {
        for (const nombre in productos['pollitos']) {
            const option = document.createElement('option');
            option.value = nombre;
            option.textContent = nombre;
            select.appendChild(option);
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

    // Ocultar/mostrar los contenedores de inputs
    ventaInputsContainer.style.display = 'none';
    cotizacionInputsContainer.style.display = 'none';
    reservaInputsContainer.style.display = 'none'; 
    
    // Ocultar botones de impresión específicos de venta/cotización
    if(imprimirBtnVenta) imprimirBtnVenta.style.display = 'none';
    if(imprimirBtnCotizacion) imprimirBtnCotizacion.style.display = 'none';
    
    // Lógica específica para cada modo
    if (modo === 'cotizaciones') {
        cotizacionInputsContainer.style.display = 'block';
        if(imprimirBtnCotizacion) imprimirBtnCotizacion.style.display = 'block';
    } else if (modo === 'pollitos') {
        reservaInputsContainer.style.display = 'block';
        // En este modo la impresión la hace 'Reservar Pollitos'
        calcularReserva();
    } 
    else {
        ventaInputsContainer.style.display = 'block';
        if(imprimirBtnVenta) {
            imprimirBtnVenta.style.display = 'block';
            imprimirBtnVenta.textContent = (modo === 'papelitos' ? 'Imprimir 2 Copias 🖨️' : 'Imprimir Ticket 🖨️');
        }
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
    // Limpiar campos de reserva
    clienteReservaInput.value = '';
    pollitoTipoSelect.value = '';
    cantidadReservaInput.value = '10';
    fechaEntregaInput.value = '';
    abonoReservaInput.value = '';
    totalReservaSpan.textContent = '$0.00';
    restaReservaSpan.textContent = '$0.00';
    detalleReservaItemDiv.innerHTML = '';
}

// NUEVA FUNCIÓN: Cálculo dinámico de la reserva
function calcularReserva() {
    const tipo = pollitoTipoSelect.value;
    const cantidad = parseInt(cantidadReservaInput.value) || 0;
    let abono = parseFloat(abonoReservaInput.value) || 0;
    
    const precioUnitario = productos['pollitos'] && productos['pollitos'][tipo] ? productos['pollitos'][tipo] : 0;
    
    const total = precioUnitario * cantidad;
    
    // Validar que el abono no exceda el total
    if (abono > total) {
        abono = total;
        abonoReservaInput.value = total.toFixed(2);
    }
    // Asegurar que abono no sea negativo
    if (abono < 0) {
        abono = 0;
        abonoReservaInput.value = '0.00';
    }

    const resta = total - abono;

    // Actualizar objeto de reserva actual
    reservaActual = {
        tipo: tipo,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        total: total,
        abono: abono,
        resta: resta,
        fechaEntrega: fechaEntregaInput.value
    };

    // Actualizar el DOM
    totalReservaSpan.textContent = `$${total.toFixed(2)}`;
    restaReservaSpan.textContent = `$${resta.toFixed(2)}`;
    
    // Mostrar detalle del item
    detalleReservaItemDiv.innerHTML = '';
    if (tipo && cantidad > 0) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-row';
        itemDiv.innerHTML = `
            <span>${tipo} (${cantidad} x $${precioUnitario.toFixed(2)})</span>
            <span>$${total.toFixed(2)}</span>
        `;
        detalleReservaItemDiv.appendChild(itemDiv);
    }
}

// NUEVA FUNCIÓN: Procesar la reserva (Validación e Impresión)
function procesarReserva() {
    calcularReserva(); // Asegurar que los cálculos estén actualizados

    if (reservaActual.total <= 0) {
        alert('❌ Por favor, seleccione un tipo de pollito y una cantidad válida.');
        return;
    }
    if (!clienteReservaInput.value.trim()) {
        alert('❌ Por favor, ingrese el nombre del cliente.');
        clienteReservaInput.focus();
        return;
    }
    if (!fechaEntregaInput.value) {
        alert('❌ Por favor, ingrese la fecha de entrega.');
        fechaEntregaInput.focus();
        return;
    }

    // Aquí iría la lógica para guardar la reserva en el sistema (Pendiente)

    imprimirTickets();
}

function agregarProducto() {
    const nombreProducto = productoInput.value;
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const precioUnitario = productos[modoActual] && productos[modoActual][nombreProducto] ? productos[modoActual][nombreProducto] : 0;

    if (precioUnitario > 0 && cantidad > 0) {
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
    
    // Función de formato de fecha para la impresión
    const formatPrintDate = (date) => {
        if (!date) return 'N/A';
        // Convierte la cadena 'YYYY-MM-DD' a un objeto Date para formatear
        return new Date(date + 'T00:00:00').toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (modoActual === 'pollitos') {
        const { tipo, cantidad, precioUnitario, total, abono, resta, fechaEntrega } = reservaActual;
        const clienteNombre = clienteReservaInput.value;
        const fechaReserva = formatPrintDate(new Date().toISOString().slice(0, 10)); // Formatea la fecha actual de reserva
        const fechaEntregaFmt = formatPrintDate(fechaEntrega);

        if (total === 0) {
             alert('❌ No hay una reserva válida para imprimir.');
             return;
        }

        const detalleReservaHTML = `
            <div class="item-row">
                <span>${tipo} (${cantidad} x $${precioUnitario.toFixed(2)})</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
        
        ticketHTML = `
            <div class="print-copy">
                <h3 style="text-align: center;">RESERVA DE POLLITOS</h3>
                <p style="text-align: center;">AGROSERVICIO Y FERRETERIA BUJAIDA</p>
                <p style="text-align: center;">Teléfono y Whatsapp 7296-9007</p>
                <hr>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                <p><strong>Fecha de Reserva:</strong> ${fechaReserva}</p>
                <p><strong>Fecha Estimada de Entrega:</strong> ${fechaEntregaFmt}</p>
                <hr>
                ${detalleReservaHTML}
                <hr>
                <div class="item-row">
                    <strong>Total a Pagar:</strong>
                    <strong>$${total.toFixed(2)}</strong>
                </div>
                <div class="item-row">
                    <strong>Abono:</strong>
                    <strong>$${abono.toFixed(2)}</strong>
                </div>
                <div class="item-row">
                    <strong>Resta por Cancelar:</strong>
                    <strong style="color: #d9534f;">$${resta.toFixed(2)}</strong>
                </div>
                <hr>
                <p style="text-align: center; font-size: 10px; margin-top: 15px;">
                    Por control de calidad, debe pasar por sus pollitos el dia asignado en el momento de la reserva
                </p>
                <p style="text-align: center; margin-top: 20px;">** Gracias por su reserva **</p>
            </div>
        `;

    } else if (modoActual === 'cotizaciones') {
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
        
        const copiaCopia = `
            <div class="print-copy">
                <h3 style="text-align: center;">COPIA CAJA</h3>
                <p style="text-align: center;">${fechaActual}</p>
                <p style="text-align: center;">** Registro Interno **</p>
                <hr>
                <p><strong>Cliente:</strong> ${clienteNombre}</p>
                ${ticketContent}
            </div>
        `;
        ticketHTML = copiaCliente + copiaCopia;

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
