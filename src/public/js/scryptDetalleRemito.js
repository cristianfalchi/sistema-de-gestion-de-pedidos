// inicializo el cursor en el primer campo cuando carga el documento
document.getElementById('1').focus();
document.getElementById('1').select();

// Mostrando mensajes al cargar si los hay
if (!document.querySelector('.alert-msg-other').classList.contains('hidden')) {
    setTimeout(() => {
        document.querySelector('.alert-msg-other').classList.add('hidden');
    }, 4000)
}

// ---- Variables y constantes auxiliares (INICIO)-----

let maxSecuencia = document.getElementById('max-secuencia').value;

// Obtengo todos los productos cargados desde el inicio
const allDivItems = document.querySelectorAll('.div-one-item');

// Cantidad de items en el pedido actualmente
let cantidadOfItems = allDivItems.length;


// obtengo los datos del formulario de busqueda de pedidos
// pedido, cliente,estado,fecha_desde, fecha_hasta, escaneado, nroCliente, nroPedido 
// ['24090', '9997', 'G', '2022-03-17, '2022-03-28', 'false', '7442', '24090'] ejemplo
const datosPedido = document.getElementById('datos-pedido').value.trim().split("*");

// -- Formulariod de busqueda --
const pedido = datosPedido[0];
const cliente = datosPedido[1];
const estado = datosPedido[2];
const fecha_desde = datosPedido[3];
const fecha_hasta = datosPedido[4];


// -- Datos del pedido
const escaneado = datosPedido[5];
const nroCliente = datosPedido[6];
const nroPedido = datosPedido[7];

// Guardo el estado inicial del pedido
const select = document.querySelector('.select-estado');
const selectedIndex = select.selectedIndex;

// marcas que me indica cuando quiero realizar una operacion sobre el pedido
let envioFormulario = 0;
let eliminarItem = 0;
let agregarItem = 0;
let eliminarPedido = 0;
let cancelarPedido = 0;


// Para ignorar un producto que no este en la base de datos
let elementCodProduct = null;

// Guardo el item que se va a eliminar
let divItemEliminado = null;

//todos los elementos inputs del formulario con la clase 'input-event'
const inputsFormAll = document.querySelectorAll('.input-event');
// cantidad de inputs
let inputsTotal = inputsFormAll.length;

// obtengo todos los <producto-descripcion>
const divProducts = document.querySelectorAll('.div-products');

// obtengo el formulario
const formularioItems = document.getElementById('form');
// ---- Variables y constantes auxiliares (FINAL)-----

// Funcion que setea la propiedad value del producto a eliminar si nuevo o ya se encontraba en la base de datos
function setValue(divitem) {

    for (const element of allDivItems) {
        if (element.isEqualNode(divitem)) {
            return true;
        }
    }
}

// Se selecciona el texto de los inputs cuando se obtiene el FOCO
for (let i = 0; i < inputsFormAll.length; i++) {

    inputsFormAll[i].addEventListener("focus", (event) => {
        ifHaveFocus(inputsFormAll[i]);
    })
}

// Seteo el color de cada fila de producto
for (let i = 0; i < cantidadOfItems; i++) {

    if (i % 2 == 0) {
        document.getElementById(`item-${i + 1}`).classList.add('color-white');
        // divItemEliminado
    }

}

// FUNCIONES

// Funcion que maneja el evento focus de los nuevos inputs que agrego al DOM
function ifHaveFocus(element) {
    element.select();
}

// Funcion que maneja el evento blur de los nuevos inputs que agrego al DOM
async function ifLostFocus(element) {

    if (element.value == '') {
        elementCodProduct = element;
        document.getElementById('text-warning').innerHTML = "El campo no puede estar vacio."
        document.querySelector('.container-msg-warning').classList.remove('hidden');
        document.querySelector('.btn-aceptar-warning').focus();

    } else {
        if (element.classList.contains('cod-prod')) {
            const inputDescripcion = document.getElementById(Number(element.id) + 1);
            const res = await fetch(`/productos/${element.value}`)
            const resJson = await res.json();
            if (Object.keys(resJson).length > 0) {  // si el producto existe en la BD
                inputDescripcion.value = resJson.pro_nom;
            } else {
                elementCodProduct = document.getElementById(Number(element.id) + 1);
                document.getElementById('text-warning').innerHTML = "Producto inexistente!";
                document.querySelector('.container-msg-warning').classList.remove('hidden');
                document.querySelector('.btn-aceptar-warning').focus();
            }
        }
    }
}

// Funcion que maneja el evento de presionar ENTER en un input del formulario
function pressEnterInput(event) {
    event.preventDefault();
    // en caso de que sea el ultimo input posiciono su foco en el boton agregar nuevo producto
    if (Number(event.target.id) == inputsTotal) {
        document.querySelector('.img-add-item').focus();
    } else {
        document.getElementById(Number(event.target.id) + 1).focus();
    }
}

// Funcion que maneja el evento de presionar DOWN en un input del formulario
function pressDownInput(event) {
    event.preventDefault();
    if (event.keyCode == 40) {
        const idDivItem = event.target.parentNode.id.slice(5);
        if (Number(idDivItem) !== cantidadOfItems) {
            document.getElementById(Number(event.target.id) + 3).focus()
        }

    }

}

// Funcion que maneja el evento de presionar UP en un input del formulario
function pressUpInput(event) {
    event.preventDefault();
    if (event.keyCode == 38) {
        const idDivItem = event.target.parentNode.id.slice(5);
        if (Number(idDivItem) !== 1) {
            document.getElementById(Number(event.target.id) - 3).focus()
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
    const inputElement = event.target.parentNode.id.slice(5);
    if (event.target.matches('.input-event') && document.getElementById(`modificado-${inputElement}`).value == 0) {
        document.getElementById(`modificado-${inputElement}`).value = "1";
        document.querySelector('.alert-msg-save').style.display = 'flex';
    }
})

// Si se presiona una tecla cuando se esta en algun campo del formulario y hay un cartel de advertencia abierto
// eventos para teclas enter, up y down en los campos del formulario
document.addEventListener('keydown', (event) => {
    const clickedElement = event.target;

    if (clickedElement.matches('.input-event')) {
        // Si al momento de presionar una tecla hay alguna ventana de mensaje abierta
        if (!document.querySelector('.container-msg-warning').classList.contains('hidden')) {
            if (event.keyCode >= '32' && event.keyCode <= '221') {
                event.preventDefault();
                return;
            }
        }

        switch (event.keyCode) {
            // press down
            case 40:
                pressDownInput(event)
                break;
            // press up
            case 38:
                pressUpInput(event);
                break;
            // press enter 
            case 13:
                pressEnterInput(event);
                break;
            case 9:
                if (document.querySelector('.div-msg-confirmacion').style.display !== 'none') { }
                break;
            default:

                break;
        }
    } else {
        if (event.keyCode == 27) { // tecla escape
            document.querySelector('.container-msg-warning').classList.add('hidden');
            document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'none');
            if (elementCodProduct !== null) {
                elementCodProduct.focus();
                elementCodProduct = null;
            }

        }
    }
})

// Verifico si el usuario cambio el estado del pedido
select.addEventListener('change', function () {
    if (this.selectedIndex !== selectedIndex) {
        document.getElementById('estado_modificado').value = 1;

    } else {
        document.getElementById('estado_modificado').value = 0;
    }
});

// Agrego un item nuevo al pedido o borro un item del pedido o guardo los items modificados en la DB 
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

    if (clickedElement.matches('.btn-aceptar-warning')) {
        document.querySelector('.container-msg-warning').classList.add('hidden')
        elementCodProduct.focus();
    }

    if (clickedElement.matches('.btn-aceptar')) {
        if (envioFormulario == 1) { // Cuando envio los datos al servidor
            // Verifica que no haya campo vacio al enviar el formulario
            let campoVacioAlEnviar = 0;
            for (let i = 0; i < formularioItems.length; i++) {
                if (formularioItems[i].nodeName == "INPUT" && formularioItems[i].value == '') {
                    campoVacioAlEnviar = 1;
                }
            }
            if (campoVacioAlEnviar == 1) {
                envioFormulario = 0;
                document.getElementById('msg-save-or-delete').innerHTML = " Complete el campo vacio por favor!";
                document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
                document.querySelector('.btn-aceptar').focus();
                return;
            } else {
                // envio el formulario
                document.querySelector('.container-img-loading').style.display = "block";
                envioFormulario = 0;
                formularioItems.submit();
            }

        }

        if (eliminarItem == 1) { // Si elimino un item del pedido¨
            // Obtengo el id del item eliminado

            let idDivEliminado = divItemEliminado.id.slice(5);
            divItemEliminado.setAttribute("hidden", "true");
            divItemEliminado.classList.remove("div-one-item");
            // Extraigo el id del divItem eliminado

            if (setValue(divItemEliminado)) {
                divItemEliminado.children[3].children[1].setAttribute("value", 3); // lo elimino de la base de datos en el backend
            } else {
                divItemEliminado.children[3].children[1].setAttribute("value", 0); // no hago nada en el backend con este elemento
            }
            divItemEliminado.setAttribute("id", "");
            divItemEliminado.children[0].setAttribute("id", "");
            divItemEliminado.children[0].classList.remove('input-event');
            divItemEliminado.children[1].setAttribute("id", "");
            divItemEliminado.children[1].classList.remove('input-event');
            divItemEliminado.children[2].setAttribute("id", "");
            divItemEliminado.children[2].classList.remove('input-event');
            divItemEliminado.children[3].children[0].setAttribute("id", "");
            divItemEliminado.children[3].children[1].setAttribute("id", "");
            divItemEliminado.children[3].children[2].setAttribute("id", "");


            // Reorganizar los id de los Productos

            const allItems = document.querySelectorAll('.div-one-item');

            for (let i = idDivEliminado - 1; i < allItems.length; i++) {
                allItems[i].setAttribute("id", `item-${i + 1}`);
                allItems[i].children[0].setAttribute("id", 3 * i + 1); // 4*i + 1
                allItems[i].children[1].setAttribute("id", 3 * i + 2);
                allItems[i].children[2].setAttribute("id", 3 * i + 3);
                allItems[i].children[3].children[0].setAttribute("id", `delete-${i + 1}`);
                allItems[i].children[3].children[1].setAttribute("id", `modificado-${i + 1}`);
                allItems[i].children[3].children[2].setAttribute("id", `secuencia-${i + 1}`);
                if (i % 2 == 0) {
                    allItems[i].classList.add('color-white');
                } else {
                    allItems[i].classList.remove('color-white')
                }
            }

            cantidadOfItems--;
            document.querySelector(".cant-items").innerHTML = 'Cantidad de Items: ' + cantidadOfItems;
            inputsTotal -= 3;
            eliminarItem = 0;
            document.querySelector('.alert-msg-save').style.display = 'flex';
        }
        if (agregarItem == 1) { // Si agrego un item al pedido
            // Creando elementos

            const divItem = document.createElement('div');
            const inputProducto = document.createElement('input');
            const inputDescripcion = document.createElement('input');
            const inputCantidad = document.createElement('input');
            const divIcons = document.createElement('div');
            const imgDelete = document.createElement('img');
            const inputModificado = document.createElement('input');
            const inputSecuencia = document.createElement('input');


            // Seteando los atributos
            divItem.setAttribute("id", `item-${cantidadOfItems + 1}`);
            // Seteo el color de cada item
            divItem.setAttribute("class", `div-one-item form-detalle-pedido__item ${(cantidadOfItems % 2 == 0) ? 'color-white' : ''}`)


            inputProducto.setAttribute("id", inputsTotal + 1);
            inputProducto.setAttribute("name", "producto");
            inputProducto.setAttribute("type", "number");
            inputProducto.setAttribute("required", "true");
            inputProducto.setAttribute("class", "input-event cod-prod style-cod-product-remito");
            inputProducto.setAttribute("onblur", "ifLostFocus(this)");
            inputProducto.setAttribute("onfocus", "ifHaveFocus(this)");


            inputDescripcion.setAttribute("id", inputsTotal + 2);
            inputDescripcion.setAttribute("name", "pro_nom");
            inputDescripcion.setAttribute("type", "text");
            inputDescripcion.setAttribute("required", "true");
            inputDescripcion.setAttribute("autocomplete", "off");
            inputDescripcion.setAttribute("class", "input-event description-prod style-description-prod-remito");
            inputDescripcion.setAttribute("onblur", "ifLostFocus(this)");
            inputDescripcion.setAttribute("onfocus", "ifHaveFocus(this)");


            inputCantidad.setAttribute("id", inputsTotal + 3);
            inputCantidad.setAttribute("name", "cantidad");
            inputCantidad.setAttribute("type", "number");
            inputCantidad.setAttribute("required", "true");
            inputCantidad.setAttribute("class", "input-event cantidad-ingresada style-cantidad-ingresada-remito");
            inputCantidad.setAttribute("onblur", "ifLostFocus(this)");
            inputCantidad.setAttribute("onfocus", "ifHaveFocus(this)");


            divIcons.setAttribute("class", "icons-operations");

            imgDelete.setAttribute("id", `delete-${cantidadOfItems + 1}`);
            imgDelete.setAttribute("title", "Eliminar item");
            imgDelete.setAttribute("class", "icon-operation icon-operation-delete");
            imgDelete.setAttribute("src", "/img/icon/trash-can-solid.svg");

            inputModificado.setAttribute("id", `modificado-${cantidadOfItems + 1}`);
            inputModificado.setAttribute("name", "item_modificado");
            inputModificado.setAttribute("type", "number");
            inputModificado.setAttribute("hidden", "true");
            inputModificado.setAttribute("value", "2");

            inputSecuencia.setAttribute("id", `secuencia-${cantidadOfItems + 1}`);
            inputSecuencia.setAttribute("name", "item_secuencia");
            inputSecuencia.setAttribute("type", "number");
            inputSecuencia.setAttribute("hidden", "true");
            inputSecuencia.setAttribute("value", `${Number(maxSecuencia) + 1}`);


            // componemos el item completo
            divIcons.append(imgDelete);
            divIcons.append(inputModificado);
            divIcons.append(inputSecuencia);

            divItem.append(inputProducto);
            divItem.append(inputDescripcion);
            divItem.append(inputCantidad);
            divItem.append(divIcons);

            formularioItems.append(divItem);


            inputProducto.focus(); // pongo el foco en el input de codigo de producto
            cantidadOfItems++; // Seteo variable porque ahora hay un items mas
            maxSecuencia++; // para setear el nuevo producto con un numero de secuencia
            inputsTotal += 3; // Ahora hay tres input mas. Codigo de producto, descripcion y cantidad
            agregarItem = 0;
            document.querySelector(".cant-items").innerHTML = 'Cantidad de Items: ' + cantidadOfItems;
            document.querySelector('.alert-msg-save').style.display = 'flex';
        }
        if (eliminarPedido == 1) {
            window.location.assign(`/remitos/delete/${nroPedido}/${nroCliente}`);
            eliminarPedido = 0;
            document.querySelector('.img-loading').src = "/img/icon/deleting-gif.gif";
            document.querySelector('.container-img-loading').style.display = "block";
        }
        if (cancelarPedido == 1) {
            cancelarPedido = 0;
            window.location.assign('/remitos');
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

        if (eliminarPedido == 1) {
            if (divItemEliminado !== null) {
                divItemEliminado.classList.remove('background-color-delete');
            }
            eliminarPedido = 0;
        }

        document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'none');

    }

    if (clickedElement.matches('.icon-operation-delete')) { // OK

        if (cantidadOfItems == 1) {
            eliminarItem = 0;
            eliminarPedido = 1;
            divItemEliminado = document.querySelectorAll('.div-one-item')[0];
            divItemEliminado.classList.add('background-color-delete');
            document.getElementById('msg-save-or-delete').innerHTML = "Se eliminara el pedido. Continuar ?";
            document.querySelector('.img-message-confirmacion').src = "/img/icon/triangle-exclamation-solid.svg";
            document.querySelector('.div-container-msg-confirmacion').style.setProperty('display', 'flex');
            document.querySelector('.btn-aceptar').focus();
        } else {
            eliminarItem = 1;
            // Obtengo el item completo (div) 
            divItemEliminado = document.getElementById(`item-${clickedElement.id.slice(7)}`);
            // lo pinto como elimnado            
            divItemEliminado.classList.add('background-color-delete');
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