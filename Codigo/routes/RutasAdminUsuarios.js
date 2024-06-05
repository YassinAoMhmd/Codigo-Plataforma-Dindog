const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware');
const adminController = require('../controllers/ControllersAdminUsuarios');

router.get('/', isAdmin, adminController.listarUsuarios);

router.get('/new', isAdmin, adminController.mostrarUsuarioFormulario);
router.post('/', isAdmin, adminController.crearUsuario);

router.get('/:id', isAdmin, adminController.mostrarDetallesUsuario);

router.get('/:id/edit', isAdmin, adminController.mostrarEditFormulario);
router.put('/:id', isAdmin, adminController.actualizarUsuario);

router.delete('/:id', isAdmin, adminController.eliminarUsuario);

module.exports = router;
