const express = require('express');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./sequelize')
    // Ahora nos conectamos con Sequelize
sequelize.authenticate()
    .then(() => {
        console.log("Estamos conectado");
    })
    .catch(error => {
        console.log("el error de conexcion es: " + error);
    })

// ---initializations---
const app = express();

// ---Settings---
app.set('port', process.env.PORT || 5000);
// Directorio donde se encuentran los archivos de plantilla
app.set('views', path.join(__dirname, 'views'));
// El motor de plantilla que se utiliza. Permite omitir la extension del archivo de plantilla
app.set('view engine', 'ejs');

// ---Middlewares---
// Para uso como desarrollador
app.use(morgan('dev'));
// Para dar servicio de archivos estaticos
app.use(express.static(__dirname + '/public'));
// Analiza las solicitudes entrantes con cargas útiles 
app.use(express.urlencoded({ limit: '1mb', extended: true, parameterLimit: 1000000 }));
// Analiza las solicitudes entrantes con cargas JSON
app.use(express.json());
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }
// }))
// app.use(flash());
// app.use(function(req, res, next) {
//     res.locals.flash_success_message = req.flash('flash_success_message');
//     res.locals.flashs_error_message = req.flash('flash_error_message');
//     next();
// });


// ---Routes---
app.get('/', (req, res) => {
    res.render('index');
});

app.use('/remitos', require('./routes/remitosexpress'));
app.use('/pedidos', require('./routes/pedidosremotos'));
app.use('/productos', require('./routes/productos'));


// Server starting
app.listen(app.get('port'), () => {
    console.log(`Server up on port: ${app.get('port')}`);

});