const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware');
const adminStatsController = require('../controllers/ControllersAdminStats');

router.get('/', isAdmin, adminStatsController.mostrarEstadisticasGenerales);

router.get('/usuarios', isAdmin, adminStatsController.mostrarEstadisticasUsuarios);

router.get('/reservas', isAdmin, adminStatsController.mostrarEstadisticasReserva);

module.exports = router;
