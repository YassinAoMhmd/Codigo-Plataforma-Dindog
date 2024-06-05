const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware');
const reservationAdminController = require('../controllers/ControllersAdminReserva');

router.get('/', isAdmin, reservationAdminController.listarReservas);

router.put('/:id', isAdmin, reservationAdminController.actualizarEstadoReservas);

router.delete('/:id', isAdmin, reservationAdminController.eliminarReservas);

module.exports = router;
