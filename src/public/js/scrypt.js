// Evento para ejecutar el javascript solo luego de cargarse el documento HTML
document.addEventListener('DOMContentLoaded', function() {

    const img_clean = document.querySelector('.img-clean');

    img_clean.addEventListener("click", (e) => {
        const elements = document.querySelectorAll('.clean');
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].name == "vendedor" || elements[i].name == "estado" || elements[i].name == "ruta") {
                elements[i].value = "default";
            } else {
                elements[i].value = "";
            }
        }
    })

})