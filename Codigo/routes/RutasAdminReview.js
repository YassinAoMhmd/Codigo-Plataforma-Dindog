const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware');
const adminReviewController = require('../controllers/ControllersAdminReview');

router.get('/', isAdmin, adminReviewController.listarReseña);

router.get('/:id', isAdmin, adminReviewController.mostrarDetallesReseña);

router.delete('/:id', isAdmin, adminReviewController.eliminarReseña);

module.exports = router;
