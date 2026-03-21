let productos = {};
let totalVenta = 0;
let modoActual = 'papelitos';

// Constantes de Conversión
const FACTOR_YARDA_A_METRO = 0.9144;
const FACTOR_VARA_A_METRO = 0.8359; // Vara (salvadoreña/regional)
const FACTOR_PIE_A_METRO = 0.3048;
const FACTOR_PULGADA_A_METRO = 0.0254;
const FACTOR_CM_A_METRO = 0.01;

const FACTOR_LIBRA_A_KG = 0.453592;
const FACTOR_QUINTAL_A_KG = 45.3592; // 100 libras en un quintal

const FACTOR_GALON_A_LITRO = 3.78541;

const RELACION_STIHL_ML_POR_GALON = 76; // 76 ml de aceite por cada galón

const FACTOR_ARROBA_A_KG = 11.3398; // 25 lbs
const FACTOR_TONELADA_A_KG = 1000;
const FACTOR_BARRIL_A_LITRO = 158.987; // Estándar de 42 galones aprox.

// Tasas de Hierro (Varillas por 1 qq)
const HIERRO_TASAS = {
    '3/8': 14,
    '1/2': 8,
    '5/8': 5,
    '1/4': 30
};

// Referencias de elementos de VENTA / COTIZACION / POLLITOS
const listaProductosVendidos = document.getElementById('lista-productos-vendidos');
const totalPagar = document.getElementById('total-pagar');
const clienteInput = document.getElementById('cliente');
const productoInput = document.getElementById('producto');
const cantidadInput = document.getElementById('cantidad');
const ventaInputsContainer = document.getElementById('venta-inputs');
const cotizacionInputsContainer = document.getElementById('cotizacion-inputs');
const cotizacionDescripcionInput = document.getElementById('cotizacion-descripcion');
const cotizacionPrecioInput = document.getElementById('cotizacion-precio');
const listaCotizacionesItems = document.getElementById('lista-cotizaciones-items');
const imprimirBtnVenta = document.getElementById('imprimir-btn-venta');
const imprimirBtnCotizacion = document.getElementById('imprimir-btn-cotizacion');
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

// NUEVAS Referencias de elementos de MEDIDAS
const medidasInputsContainer = document.getElementById('medidas-inputs');

// Longitud
const mInput = document.getElementById('m-input');
const yardaInput = document.getElementById('yarda-input');
const varaInput = document.getElementById('vara-input');
const pieInput = document.getElementById('pie-input');
const cmInput = document.getElementById('cm-input');
const pulgadaInput = document.getElementById('pulgada-input');

// Masa/Peso
const kgInput = document.getElementById('kg-input');
const lbInput = document.getElementById('lb-input');
const quintalInput = document.getElementById('quintal-input');

// Volumen
const litroInput = document.getElementById('litro-input');
const galonInput = document.getElementById('galon-input');

// STIHL
const stihlCombustibleInput = document.getElementById('stihl-combustible-input');
const stihlUnidadSelect = document.getElementById('stihl-unidad');
const stihlAceiteML = document.getElementById('stihl-aceite-ml');


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

    if (!datalist) return;

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

    // Ocultar/mostrar contenedores de inputs
    ventaInputsContainer.style.display = 'none';
    cotizacionInputsContainer.style.display = 'none';
    reservaInputsContainer.style.display = 'none'; 
    medidasInputsContainer.style.display = 'none'; // NUEVO: Ocultar/Mostrar medidas
    
    // Ocultar botones de impresión específicos de venta/cotización
    if(imprimirBtnVenta) imprimirBtnVenta.style.display = 'none';
    if(imprimirBtnCotizacion) imprimirBtnCotizacion.style.display = 'none';
    
    // Lógica específica para cada modo
    if (modo === 'cotizaciones') {
        cotizacionInputsContainer.style.display = 'block';
        if(imprimirBtnCotizacion) imprimirBtnCotizacion.style.display = 'block';
    } else if (modo === 'pollitos') {
        reservaInputsContainer.style.display = 'block';
        calcularReserva();
    } else if (modo === 'medidas') { // NUEVO: Modo Medidas
        medidasInputsContainer.style.display = 'block';
        // No hay ticket de impresión para medidas, así que no se muestra botón.
    } 
    else {
        ventaInputsContainer.style.display = 'block';
        if(imprimirBtnVenta) {
            imprimirBtnVenta.style.display = 'block';
            imprimirBtnVenta.textContent = (modo === 'papelitos' ? 'Imprimir 2 Copias 🖨️' : 'Imprimir Ticket 🖨️');
        }
        actualizarDatalist(modo);
    }

    // Limpiar campos no activos (Opcional, pero bueno para la UX)
    if(modo !== 'pollitos') {
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
    if(modo !== 'venta_papelitos' && modo !== 'bebidas_paletas') {
         // Limpiar campos de venta
        listaProductosVendidos.innerHTML = '';
        totalVenta = 0;
        totalPagar.textContent = '$0.00';
        productoInput.value = '';
        clienteInput.value = '';
    }
    if(modo !== 'cotizaciones') {
        // Limpiar campos de cotizacion
        listaCotizacionesItems.innerHTML = '';
        cotizacionDescripcionInput.value = '';
        cotizacionPrecioInput.value = '';
    }
}

// --- CONVERSOR DE MEDIDAS ---

/**
 * Convierte un valor de longitud de una unidad de origen a todas las demás.
 * @param {string} unidadOrigen - Unidad de origen ('m', 'yarda', 'vara', 'pie', 'cm', 'pulgada').
 * @param {string} valorString - El valor ingresado en la unidad de origen.
 */
function convertirLongitud(unidadOrigen, valorString) {
    const valor = parseFloat(valorString);
    if (isNaN(valor) || valorString.trim() === '') {
        // Limpia todos los campos si el valor no es válido o está vacío
        mInput.value = '';
        yardaInput.value = '';
        varaInput.value = '';
        pieInput.value = '';
        cmInput.value = '';
        pulgadaInput.value = '';
        return;
    }

    let valorEnMetros = 0;

    // 1. Convertir la unidad de origen a la unidad base (Metros)
    switch (unidadOrigen) {
        case 'm':
            valorEnMetros = valor;
            break;
        case 'yarda':
            valorEnMetros = valor * FACTOR_YARDA_A_METRO;
            break;
        case 'vara':
            valorEnMetros = valor * FACTOR_VARA_A_METRO;
            break;
        case 'pie':
            valorEnMetros = valor * FACTOR_PIE_A_METRO;
            break;
        case 'cm':
            valorEnMetros = valor * FACTOR_CM_A_METRO;
            break;
        case 'pulgada':
            valorEnMetros = valor * FACTOR_PULGADA_A_METRO;
            break;
    }

    // 2. Convertir la unidad base (Metros) a todas las demás y actualizar los campos (excepto el de origen)
    const toFixed = 4; // Precisión de 4 decimales
    
    if (unidadOrigen !== 'm') mInput.value = valorEnMetros.toFixed(toFixed);
    if (unidadOrigen !== 'yarda') yardaInput.value = (valorEnMetros / FACTOR_YARDA_A_METRO).toFixed(toFixed);
    if (unidadOrigen !== 'vara') varaInput.value = (valorEnMetros / FACTOR_VARA_A_METRO).toFixed(toFixed);
    if (unidadOrigen !== 'pie') pieInput.value = (valorEnMetros / FACTOR_PIE_A_METRO).toFixed(toFixed);
    if (unidadOrigen !== 'cm') cmInput.value = (valorEnMetros / FACTOR_CM_A_METRO).toFixed(toFixed);
    if (unidadOrigen !== 'pulgada') pulgadaInput.value = (valorEnMetros / FACTOR_PULGADA_A_METRO).toFixed(toFixed);
}

/**
 * Convierte un valor de peso de una unidad de origen a todas las demás.
 * @param {string} unidadOrigen - Unidad de origen ('kg', 'libra', 'quintal').
 * @param {string} valorString - El valor ingresado en la unidad de origen.
 */
function convertirPeso(unidadOrigen, valorString) {
    const valor = parseFloat(valorString);
    const kgIn = document.getElementById('kg-input');
    const lbIn = document.getElementById('lb-input');
    const arrobaIn = document.getElementById('arroba-input');
    const quintalIn = document.getElementById('quintal-input');
    const tonIn = document.getElementById('ton-input');

    if (isNaN(valor) || valorString.trim() === '') {
        [kgIn, lbIn, arrobaIn, quintalIn, tonIn].forEach(i => i.value = '');
        return;
    }

    let valorEnKg = 0;
    switch (unidadOrigen) {
        case 'kg': valorEnKg = valor; break;
        case 'libra': valorEnKg = valor * FACTOR_LIBRA_A_KG; break;
        case 'arroba': valorEnKg = valor * FACTOR_ARROBA_A_KG; break;
        case 'quintal': valorEnKg = valor * FACTOR_QUINTAL_A_KG; break;
        case 'ton': valorEnKg = valor * FACTOR_TONELADA_A_KG; break;
    }

    const toFixed = 2;
    if (unidadOrigen !== 'kg') kgIn.value = valorEnKg.toFixed(toFixed);
    if (unidadOrigen !== 'libra') lbIn.value = (valorEnKg / FACTOR_LIBRA_A_KG).toFixed(toFixed);
    if (unidadOrigen !== 'arroba') arrobaIn.value = (valorEnKg / FACTOR_ARROBA_A_KG).toFixed(toFixed);
    if (unidadOrigen !== 'quintal') quintalIn.value = (valorEnKg / FACTOR_QUINTAL_A_KG).toFixed(toFixed);
    if (unidadOrigen !== 'ton') tonIn.value = (valorEnKg / FACTOR_TONELADA_A_KG).toFixed(toFixed);
}

/**
 * Convierte un valor de volumen de una unidad de origen a todas las demás.
 * @param {string} unidadOrigen - Unidad de origen ('litro', 'galon').
 * @param {string} valorString - El valor ingresado en la unidad de origen.
 */
function convertirVolumen(unidadOrigen, valorString) {
    const valor = parseFloat(valorString);
    const litroIn = document.getElementById('litro-input');
    const galonIn = document.getElementById('galon-input');
    const barrilIn = document.getElementById('barril-input');

    if (isNaN(valor) || valorString.trim() === '') {
        litroIn.value = ''; galonIn.value = ''; barrilIn.value = '';
        return;
    }

    let valorEnLitros = 0;
    switch (unidadOrigen) {
        case 'litro': valorEnLitros = valor; break;
        case 'galon': valorEnLitros = valor * FACTOR_GALON_A_LITRO; break;
        case 'barril': valorEnLitros = valor * FACTOR_BARRIL_A_LITRO; break;
    }

    const toFixed = 2;
    if (unidadOrigen !== 'litro') litroIn.value = valorEnLitros.toFixed(toFixed);
    if (unidadOrigen !== 'galon') galonIn.value = (valorEnLitros / FACTOR_GALON_A_LITRO).toFixed(toFixed);
    if (unidadOrigen !== 'barril') barrilIn.value = (valorEnLitros / FACTOR_BARRIL_A_LITRO).toFixed(toFixed);
}


/**
 * Calcula el aceite STIHL requerido en ML basándose en el combustible y su unidad.
 */
/**
 * Calcula el aceite STIHL requerido. 
 * Se asegura de usar la unidad seleccionada y el factor de 76ml por galón.
 */
function calcularStihl() {
    const combustibleInput = document.getElementById('stihl-combustible-input');
    const unidadSelect = document.getElementById('stihl-unidad');
    const resultadoDisplay = document.getElementById('stihl-aceite-ml');

    const cantidad = parseFloat(combustibleInput.value);
    const unidad = unidadSelect.value;

    if (isNaN(cantidad) || cantidad <= 0) {
        resultadoDisplay.textContent = '0.00 ml';
        return;
    }

    let galones = 0;
    if (unidad === 'galon') {
        galones = cantidad;
    } else {
        // Usamos el factor inverso: Litros / 3.78541
        galones = cantidad / FACTOR_GALON_A_LITRO;
    }

    const aceiteMl = galones * RELACION_STIHL_ML_POR_GALON;
    resultadoDisplay.textContent = aceiteMl.toFixed(2) + ' ml';
}

/**
 * Convierte cantidad de varillas de hierro a quintales (qq).
 */
/**
 * Convierte Hierro bidireccionalmente
 * @param {string} medida - '3/8', '1/2', etc.
 * @param {string} tipo - 'v' para varillas, 'q' para quintales
 * @param {string} valorString - el numero ingresado
 */
/**
 * Convierte Hierro bidireccionalmente entre Varillas y Quintales.
 */
function convertirHierro(medida, tipo, valorString) {
    const valor = parseFloat(valorString);
    // Quitamos la barra para que coincida con los IDs (ej: 3/8 -> 38)
    const idSufijo = medida.replace('/', ''); 
    const inputVarillas = document.getElementById(`h-${idSufijo}-v`);
    const inputQuintales = document.getElementById(`h-${idSufijo}-q`);

    if (isNaN(valor) || valorString.trim() === '') {
        inputVarillas.value = '';
        inputQuintales.value = '';
        return;
    }

    const tasa = HIERRO_TASAS[medida];

    if (tipo === 'v') {
        // Entrada fue varillas -> calcular quintales
        inputQuintales.value = (valor / tasa).toFixed(2);
    } else {
        // Entrada fue quintales -> calcular varillas
        inputVarillas.value = (valor * tasa).toFixed(2);
    }
}

// --- Lógica de Venta / Reserva / Cotización (Mantenida) ---

function calcularReserva() {
    // ... (MANTENER CÓDIGO DE LA FUNCIÓN calcularReserva) ...
    const tipo = pollitoTipoSelect.value;
    const cantidad = parseInt(cantidadReservaInput.value) || 0;
    let abono = parseFloat(abonoReservaInput.value) || 0;
    
    const precioUnitario = productos['pollitos'] && productos['pollitos'][tipo] ? productos['pollitos'][tipo] : 0;
    
    const total = precioUnitario * cantidad;
    
    if (abono > total) {
        abono = total;
        abonoReservaInput.value = total.toFixed(2);
    }
    if (abono < 0) {
        abono = 0;
        abonoReservaInput.value = '0.00';
    }

    const resta = total - abono;

    reservaActual = {
        tipo: tipo,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        total: total,
        abono: abono,
        resta: resta,
        fechaEntrega: fechaEntregaInput.value
    };

    totalReservaSpan.textContent = `$${total.toFixed(2)}`;
    restaReservaSpan.textContent = `$${resta.toFixed(2)}`;
    
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

function procesarReserva() {
    // ... (MANTENER CÓDIGO DE LA FUNCIÓN procesarReserva) ...
    calcularReserva();

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

    imprimirTickets();
}

function agregarProducto() {
    // ... (MANTENER CÓDIGO DE LA FUNCIÓN agregarProducto) ...
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
    // ... (MANTENER CÓDIGO DE LA FUNCIÓN agregarACotizacion) ...
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
    // ... (MANTENER CÓDIGO DE LA FUNCIÓN imprimirTickets) ...
    const printArea = document.querySelector('.print-area');
    let ticketHTML = '';
    const fechaActual = new Date().toLocaleString();
    
    const formatPrintDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date + 'T00:00:00').toLocaleDateString('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (modoActual === 'pollitos') {
        const { tipo, cantidad, precioUnitario, total, abono, resta, fechaEntrega } = reservaActual;
        const clienteNombre = clienteReservaInput.value;
        const fechaReserva = formatPrintDate(new Date().toISOString().slice(0, 10));
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
                    <strong style="color: #000000;">$${resta.toFixed(2)}</strong>
                </div>
                <hr>
                <p style="text-align: center; font-size: 10px; margin-top: 15px;">
                    Por control de calidad, debe pasar a retirar el dia asignado de entrega, de lo contrario perdera su reserva
                </p>
                <p style="text-align: center; margin-top: 20px;">** Gracias por su Compra **</p>
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
    
    if (ticketHTML) {
        printArea.innerHTML = ticketHTML;
        window.print();
    }
}
