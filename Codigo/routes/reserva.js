const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reserva');
const { isLoggedIn, isCuidador } = require('../middleware');

router.post('/', isLoggedIn, reservaController.crearReserva);
router.get('/mis-reservas', isLoggedIn, reservaController.verReservasUsuario);
router.get('/pendientes', isLoggedIn, isCuidador, reservaController.reservasPendientes);
router.patch('/actualizar/:id', isLoggedIn, isCuidador, reservaController.actualizarEstadoReserva); 
router.get('/nueva/:cuidadorId', isLoggedIn, reservaController.mostrarFormularioReserva);
router.post('/nueva/:cuidadorId', isLoggedIn, reservaController.crearReserva);
router.get('/:id', isLoggedIn, reservaController.detalleReserva);
router.patch('/cancelar/:id', isLoggedIn, reservaController.cancelarReserva);

module.exports = router;
