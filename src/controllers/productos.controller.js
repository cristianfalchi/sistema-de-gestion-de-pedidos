const Producto = require('../models/producto.model');

module.exports = {

    allProducts: async (req, res) => {
        Producto.removeAttribute('id');
        const products = await Producto.findAll({ raw: true });
        res.json(products);
    },

    oneProduct: async (req, res) => {
        Producto.removeAttribute('id');
        const products = await Producto.findAll({ raw: true });
        const position = binarySearch(req.params.codCliente, products);
        if (position !== -1) {
            res.json(products[position]);
        } else {
            res.json({});
        }

    }
}

function binarySearch(value, list) {
    let first = 0; //left endpoint
    let last = list.length - 1; //right endpoint
    let position = -1;
    let found = false;
    let middle;
    let count = 0;
    while (found === false && first <= last) {

        middle = Math.floor((first + last) / 2);

        if (Number(list[middle].producto) == value) {
            found = true;
            position = middle;
        } else if (Number(list[middle].producto) > value) { //if in lower half
            last = middle - 1;
        } else { //in in upper half
            first = middle + 1;
        }
    }
    return position;
}