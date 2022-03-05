// inicializo el cursor en el primer campo cuando carga el documento
document.getElementById('1').focus();
document.getElementById('1').select();

// Mostrando mensajes al cargar si los hay
if (!document.querySelector('.alert-msg-other').classList.contains('hidden')) {
    setTimeout(() => {
        document.querySelector('.alert-msg-other').classList.add('hidden');
    }, 4000)
}


// Cantidad de items en el pedido actualmente
let cantidadOfItems = document.querySelectorAll('.div-one-item').length;
// ---- Variables y constantes auxiliares (INICIO)-----

// obtengo los datos del formulario de busqueda de pedidos
// pedido, cliente, vendedor, estado, ruta, fecha_desde, fecha_hasta, escaneado, nroCliente, nroPedido 
// ['24090', '9997', '025', 'G', '01', '2022', '03', '17', '2022', '03', '15', 'false', '7442', '24090'] ejemplo
const datosPedido = document.getElementById('datos-pedido').value.trim().split("-");
// const pedido = document.getElementById('pedido').value;

// -- Formulariod de busqueda --
const pedido = datosPedido[0];
const cliente = datosPedido[1];
const vendedor = datosPedido[2];
const estado = datosPedido[3];
const ruta = datosPedido[4];
const fecha_desde = datosPedido[5];
const fecha_hasta = datosPedido[6];

// -- Datos del pedido
const escaneado = datosPedido[7];
const nroCliente = datosPedido[8];
const nroPedido = datosPedido[9];
const nroRuta = datosPedido[10];

// Guardo el estado inicial del pedido
const select = document.querySelector('.select-estado');
const selectedIndex = select.selectedIndex;

// Guardo el numero de cliente y el numero de pedido
// const nroPedido = document.getElementById('nro-pedido').innerHTML.trim();
// const nroCliente = document.getElementById('nro-cliente').innerHTML.trim();

// Aquie guardo el codigo de producto y el numero de secuencia cuando elimino un item
let codProducto = "";
let numSecuencia = "";


// marcas que me indica cuando quiero realizar una operacion sobre el pedido
let envioFormulario = 0;
let eliminarItem = 0;
let agregarItem = 0;
let eliminarPedido = 0;
let cancelarPedido = 0;


// ---- Variables y constantes auxiliares (FINAL)-----




//todos los elementos inputs del formulario con la clase 'input-event'
const inputsFormAll = document.querySelectorAll('.input-event');

// obtengo todos los <producto-descripcion>
const divProducts = document.querySelectorAll('.div-products');

// obtengo el formulario
const formularioItems = document.getElementById('form');

// Se selecciona el texto de los inputs cuando se obtiene el FOCO
for (let i = 0; i < inputsFormAll.length; i++) {

    inputsFormAll[i].addEventListener("focus", (event) => {
        event.target.select();
    })
}

// Seteo el color de cada fila de producto
for (let i = 0; i < cantidadOfItems; i++) {

    if (i % 2 == 0) {
        document.getElementById(`item-${i + 1 }`).classList.add('color-white');
        // divItemEliminado
    }

}


// Funcion que maneja el evento focus de los nuevos inputs que agrego al DOM
function ifHaveFocus(element) {
    element.select();
}

// Funcion que maneja el evento blur de los nuevos inputs que agrego al DOM
function ifLostFocus(element) {

    if (element.value == '') {
        element.focus();
        document.getElementById('msg-warning').innerHTML = "El campo no puede estar vacio."
        document.querySelector('.container-msg-vacio').style.setProperty('display', 'flex');
    } else {
        if (element.classList.contains('cod-prod')) {
            // Obtengo el input descripcion de producto
            const inputDescripcion = document.getElementById(Number(element.id) + 1);
            const inputPrecio = document.getElementById(Number(element.id) + 2);
            let position = binarySearch(element.value, divProducts);
            if (position !== -1) {
                inputDescripcion.value = divProducts[position].innerText.split('*')[1].trim();
                inputPrecio.value = divProducts[position].innerText.split('*')[2].trim();
            } else {
                element.focus();
                document.getElementById('msg-warning').innerHTML = "Producto inexistente";
                document.querySelector('.container-msg-vacio').style.setProperty('display', 'flex');
            }

        }
    }
}

// Funcion que maneja el evento de presionar ENTER en un input del formulario
function pressEnterInput(event) {

    if (event.keyCode == 13) {

        // Obtengo todos los inputs excepto los que se hayan eliminado
        const inpusVisibles = document.querySelectorAll('.input-event');
        // en caso de que sea el ultimo input posiciono su foco en el boton agregar nuevo producto
        if (Number(event.target.id) == inpusVisibles.length) {
            document.querySelector('.img-add-item').focus();
        } else {
            document.getElementById(Number(event.target.id) + 1).focus();
        }
    }

}

// Funcion que maneja el evento de presionar DOWN en un input del formulario
function pressDownInput(event) {

    if (event.keyCode == 40) {

        // Obtengo la cantidad de items del pedido
        const cantidadItems = document.querySelectorAll('.div-one-item').length;
        const idDivItem = event.target.parentNode.id.slice(5);
        if (Number(idDivItem) !== cantidadItems) {
            document.getElementById(Number(event.target.id) + 4).focus()
        }

    }

}

// Funcion que maneja el evento de presionar UP en un input del formulario
function pressUpInput(event) {

    if (event.keyCode == 38) {
        const idDivItem = event.target.parentNode.id.slice(5);
        if (Number(idDivItem) !== 1) {
            document.getElementById(Number(event.target.id) - 4).focus()
        }

    }

}

// Agrego el evento ON-BLUR a todos los inputs
for (let i = 0; i < inputsFormAll.length; i++) {

    inputsFormAll[i].addEventListener("blur", (event) => {
        ifLostFocus(inputsFormAll[i]);
    })
}

// registro los productos que el usuario ha modificado
document.addEventListener('change', (event) => {
    const clickedElement = event.target;
    if (clickedElement.matches('.input-event')) {
        document.getElementById(`modificado-${clickedElement.parentNode.id.slice(5)}`).value = 1;
        document.querySelector('.alert-msg-save').style.display = 'flex';
    }
})

// ENTER comportamiento de flechas down y up para los campos producto, descripcion, cantidad,
document.addEventListener('keydown', (event) => {
    const clickedElement = event.target;

    if (clickedElement.matches('.input-event')) {

        // Si al momento de presionar una tecla hay alguna ventana de mensaje abierta
        if (document.querySelector('.container-msg-vacio').style.display == 'flex') {
            if (event.keyCode >= '32' && event.keyCode <= '221') {
                event.preventDefault();
            }
        }

        // const typeInput = event.target.id.charAt(0);
        // let nroProd = Number(event.target.id.slice(1));
        switch (event.keyCode) {
            // press down
            case 40:
                event.preventDefault();
                pressDownInput(event)
                break;
                // press up
            case 38:
                event.preventDefault();
                pressUpInput(event);
                break;
                // press enter 
            case 13:

                event.preventDefault();
                pressEnterInput(event);
                break;
            case 9:
                if (document.querySelector('.div-msg-confirmacion').style.display !== 'none') {}
                break;
            default:

                break;
        }
    }
})


//tecla escape para ocultar cartel de error y eliminar articulo
document.addEventListener('keydown', (event) => {
    if (event.keyCode == 27) {
        document.querySelector('.container-msg-vacio').style.setProperty('display', 'none');
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'none');
    }

})

// Verifico si el usuario cambio el estado del pedido
select.addEventListener('change', function() {
    if (this.selectedIndex !== selectedIndex) {
        document.getElementById('estado_modificado').value = 1;
        document.querySelector('.alert-changes').style.display = 'flex';
    } else {
        document.getElementById('estado_modificado').value = 0;
    }
});

// Agrego un item nuevo al pedido o borro un item del pedido o guardo los items modificados en la DB 
const items = document.querySelectorAll('.icon-operation-delete');
document.addEventListener('click', (event) => { //Antes de event delegation, se usaba un loop

    const clickedElement = event.target;

    if (clickedElement.matches('.btn-delete-pedido')) {
        eliminarPedido = 1;
        event.preventDefault();
        document.getElementById('msg-save-or-delete').innerHTML = "¿ Desea Eliminar el pedido ?";
        document.querySelector('.img-message-confirmacion').src = "/img/icon/triangle-exclamation-solid.svg";
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
        document.querySelector('.btn-cancelar').focus();

    }

    if (clickedElement.matches('.btn-aceptar')) {
        if (envioFormulario == 1) { // Cuando envio los datos al servidor
            let señal = 0;
            for (let i = 0; i < formularioItems.length; i++) {
                if (formularioItems[i].nodeName == "INPUT" && formularioItems[i].value == '') {
                    señal = 1;
                }
            }
            if (señal == 1) {

                document.getElementById('msg-save-or-delete').innerHTML = " Complete el campo vacio por favor!";
                document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
                document.querySelector('.btn-aceptar').focus();
                return
            } else {
                document.querySelector('.container-img-loading').style.display = "block";
                envioFormulario = 0;
            }
            console.log("asdsdadadad");
            formularioItems.submit();
        }
        if (eliminarItem == 1) { // Si elimino un item del pedido
            document.querySelector('.img-loading').src = "/img/icon/deleting-gif.gif";
            document.querySelector('.container-img-loading').style.display = "block";
            window.location.assign(`/pedidos/delete/item/${nroPedido}/${nroCliente}/${codProducto}/${numSecuencia}/${nroRuta}?escaneado=${escaneado}&pedido=${pedido}&cliente=${cliente}&vendedor=${vendedor}&estado=${estado}&ruta=${ruta}&fecha_desde=${fecha_desde}&fecha_hasta=${fecha_hasta}`);

        }
        if (agregarItem == 1) { // Si agrego un item al pedido
            // Creando elementos

            const totalInputs = document.querySelectorAll('.input-event').length;

            const divItem = document.createElement('div');
            const inputProducto = document.createElement('input');
            const inputDescripcion = document.createElement('input');
            const inputPrecio = document.createElement('input');
            const inputCantidad = document.createElement('input');
            const divIcons = document.createElement('div');
            const imgDelete = document.createElement('img');
            const inputModificado = document.createElement('input');
            const inputEliminado = document.createElement('input');
            const inputAgregado = document.createElement('input');
            const inputSecuencia = document.createElement('input');


            // Seteando los atributos
            divItem.setAttribute("id", `item-${cantidadOfItems + 1}`);
            // Seteo el color de cada item
            divItem.setAttribute("class", `div-one-item form-detalle-pedido__item ${(cantidadOfItems % 2 == 0) ? 'color-white': ''}`)


            inputProducto.setAttribute("id", totalInputs + 1);
            inputProducto.setAttribute("name", "producto");
            inputProducto.setAttribute("type", "number");
            inputProducto.setAttribute("required", "true");
            inputProducto.setAttribute("class", "cod-prod style-cod-product input-event");
            inputProducto.setAttribute("onblur", "ifLostFocus(this)");
            inputProducto.setAttribute("onfocus", "ifHaveFocus(this)");
            inputProducto.setAttribute("onkeydown", "pressEnterInput(event)");

            inputDescripcion.setAttribute("id", totalInputs + 2);
            inputDescripcion.setAttribute("name", "pro_nom");
            inputDescripcion.setAttribute("type", "text");
            inputDescripcion.setAttribute("required", "true");
            inputDescripcion.setAttribute("autocomplete", "off");
            inputDescripcion.setAttribute("class", "description-prod style-description-prod input-event");
            inputDescripcion.setAttribute("onblur", "ifLostFocus(this)");
            inputDescripcion.setAttribute("onfocus", "ifHaveFocus(this)");
            inputDescripcion.setAttribute("onkeydown", "pressEnterInput(event)");

            inputPrecio.setAttribute("id", totalInputs + 3);
            inputPrecio.setAttribute("name", "precio");
            inputPrecio.setAttribute("type", "number");
            inputPrecio.setAttribute("required", "true");
            inputPrecio.setAttribute("min", "0");
            inputPrecio.setAttribute("step", "0.01");
            inputPrecio.setAttribute("class", "input-event precio-prod style-precio-prod");
            inputPrecio.setAttribute("onblur", "ifLostFocus(this)");
            inputPrecio.setAttribute("onfocus", "ifHaveFocus(this)");
            inputPrecio.setAttribute("onkeydown", "pressEnterInput(event)");

            inputCantidad.setAttribute("id", totalInputs + 4);
            inputCantidad.setAttribute("name", "cantidad");
            inputCantidad.setAttribute("type", "number");
            inputCantidad.setAttribute("required", "true");
            inputPrecio.setAttribute("min", "0");
            inputCantidad.setAttribute("class", "cantidad-ingresada style-cantidad-ingresada input-event");
            inputCantidad.setAttribute("onblur", "ifLostFocus(this)");
            inputCantidad.setAttribute("onfocus", "ifHaveFocus(this)");
            inputCantidad.setAttribute("onkeydown", "pressEnterInput(event)");

            divIcons.setAttribute("class", "icons-operations");

            imgDelete.setAttribute("id", `delete-${cantidadOfItems + 1}`);
            imgDelete.setAttribute("title", "Eliminar item");
            imgDelete.setAttribute("class", "icon-operation icon-operation-delete");
            imgDelete.setAttribute("src", "/img/icon/trash-can-solid.svg");

            inputModificado.setAttribute("id", `modificado-${cantidadOfItems + 1}`);
            inputModificado.setAttribute("name", "cantidad_modificada");
            inputModificado.setAttribute("type", "number");
            inputModificado.setAttribute("hidden", "true");
            inputModificado.setAttribute("value", "0");


            inputAgregado.setAttribute("id", `agregado-${cantidadOfItems + 1}`);
            inputAgregado.setAttribute("name", "item_agregado");
            inputAgregado.setAttribute("type", "number");
            inputAgregado.setAttribute("hidden", "true");
            inputAgregado.setAttribute("value", "1");

            inputSecuencia.setAttribute("id", `secuencia-${cantidadOfItems + 1}`);
            inputSecuencia.setAttribute("name", "item_secuencia");
            inputSecuencia.setAttribute("type", "number");
            inputSecuencia.setAttribute("hidden", "true");
            inputSecuencia.setAttribute("value", `${cantidadOfItems + 1}`);


            // componemos el item completo
            divIcons.append(imgDelete);
            divIcons.append(inputModificado);
            divIcons.append(inputAgregado);
            divIcons.append(inputSecuencia);

            divItem.append(inputProducto);
            divItem.append(inputDescripcion);
            divItem.append(inputPrecio);
            divItem.append(inputCantidad);
            divItem.append(divIcons);

            formularioItems.append(divItem);

            // pongo el foco en el input de codigo de producto
            inputProducto.focus();


            cantidadOfItems++;


            agregarItem = 0;
        }
        if (eliminarPedido == 1) {
            window.location.assign(`/pedidos/delete/${nroPedido}/${nroCliente}/${nroRuta}`);
            eliminarPedido = 0;
            document.querySelector('.img-loading').src = "/img/icon/deleting-gif.gif";
            document.querySelector('.container-img-loading').style.display = "block";
        }
        if (cancelarPedido == 1) {
            cancelarPedido = 0;
            window.location.assign('/pedidos');
        }
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'none');
    }

    if (clickedElement.matches('.btn-cancelar')) {

        if (eliminarItem == 1) {

            divItemEliminado.classList.remove('background-color-delete');
            document.querySelector('.icon-operation').focus();
            eliminarItem = 0;
        }
        if (envioFormulario == 1) { // Cuando envio los datos al servidor

            document.querySelector('.img-btn-save').focus();
            envioFormulario = 0;
        }

        if (agregarItem == 1) { // Si agrego un item al pedido

            document.querySelector('.img-add-item').focus();
            agregarItem = 0;
        }

        if (cancelarPedido == 1) {
            cancelarPedido = 0;
            document.querySelector('.img-btn-cancel').focus();
        }
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'none');



    }

    if (clickedElement.matches('.icon-operation-delete')) { // OK

        if (document.querySelectorAll('.div-one-item').length == 1) {
            eliminarItem = 0;
            eliminarPedido = 1;
            event.preventDefault();
            document.querySelectorAll('.div-one-item')[0].classList.add('background-color-delete');
            document.getElementById('msg-save-or-delete').innerHTML = "Se eliminara el pedido. Continuar ?";
            document.querySelector('.img-message-confirmacion').src = "/img/icon/triangle-exclamation-solid.svg";
            document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
            document.querySelector('.btn-aceptar').focus();
        } else {
            eliminarItem = 1;
            event.preventDefault();
            const idIconDelete = clickedElement.id.slice(7);
            // Obtengo el item completo (div) 
            divItemEliminado = document.getElementById(`item-${idIconDelete}`);
            divItemEliminado.classList.add('background-color-delete');
            codProducto = document.getElementById(4 * (idIconDelete - 1) + 1).value;
            numSecuencia = document.getElementById(`secuencia-${idIconDelete}`).value;
            // nroRuta = document.getElementById()
            document.getElementById('msg-save-or-delete').innerHTML = "¿ Desea eliminar el producto ?";
            document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
            document.querySelector('.btn-aceptar').focus();
        }
    }

    // envio los datos para que sean guardados en el servidor BD
    if (clickedElement.matches('.img-btn-save')) {
        envioFormulario = 1;
        event.preventDefault();
        document.getElementById('msg-save-or-delete').innerHTML = "¿ Desea guardar los cambios ?";
        document.querySelector('.img-message-confirmacion').src = "/img/icon/circle-exclamation-solid.svg";
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
        document.querySelector('.btn-aceptar').focus();
    }

    if (clickedElement.matches('.img-btn-cancel')) {
        cancelarPedido = 1;
        event.preventDefault();
        document.getElementById('msg-save-or-delete').innerHTML = "¿ Desea cerrar el pedido ?";
        document.querySelector('.img-message-confirmacion').src = "/img/icon/circle-exclamation-solid.svg";
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
        document.querySelector('.btn-aceptar').focus();
    }

    // Agregar un item al pedido
    if (clickedElement.matches('.img-add-item') || clickedElement.matches('.p-add-item')) {
        agregarItem = 1;
        document.getElementById('msg-save-or-delete').innerHTML = "¿ Agregar nuevo producto ?";
        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
        document.querySelector('.btn-aceptar').focus();

    }

})


// Busqueda binaria
function binarySearch(value, list) {
    let first = 0; //left endpoint
    let last = list.length - 1; //right endpoint
    let position = -1;
    let found = false;
    let middle;
    let count = 0;
    while (found === false && first <= last) {

        middle = Math.floor((first + last) / 2);

        if (Number(list[middle].innerText.split('*')[0].trim()) == value) {
            found = true;
            position = middle;
        } else if (Number(list[middle].innerText.split('*')[0].trim()) > value) { //if in lower half
            last = middle - 1;
        } else { //in in upper half
            first = middle + 1;
        }
    }
    return position;
}