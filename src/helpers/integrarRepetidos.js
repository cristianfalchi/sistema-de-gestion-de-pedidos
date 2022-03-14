// Funcion que permite unificar las cantidides de los articulos que se repiten

function IntegrarRepetidos(productos) {
    const unificados = [];
    const repetidos = [];
    let anteriorRepetido = 0;
    let suma = 0;
    let indice = 0;


    for (let i = 0; i < productos.length; i++) {
        if (i !== (productos.length - 1)) {
            if (productos[i].producto == productos[i + 1].producto) {
                repetidos.push({ producto: productos[i + 1].producto, secuencia: productos[i + 1].secuencia });
                if (anteriorRepetido == 0) {
                    anteriorRepetido = 1;
                    suma = productos[i].cantidad + productos[i + 1].cantidad;
                    indice = i;
                } else {
                    suma += productos[i + 1].cantidad;
                }
            } else {
                if (anteriorRepetido == 1) {
                    if (suma > 0) {
                        unificados.push({ producto: productos[indice].producto, cantidad: suma, secuencia: productos[indice].secuencia })
                    } else {
                        repetidos.push({ producto: productos[indice].producto, secuencia: productos[indice].secuencia });
                    }
                    anteriorRepetido = 0;
                    suma = 0;
                }
            }
        } else {
            if (anteriorRepetido == 1) {
                if (suma > 0) {
                    unificados.push({ producto: productos[indice].producto, cantidad: suma, secuencia: productos[indice].secuencia })
                } else {
                    repetidos.push({ producto: productos[indice].producto, secuencia: productos[indice].secuencia });
                }
            }
        }
    }
    return { unificados, repetidos }


}

module.exports = IntegrarRepetidos;