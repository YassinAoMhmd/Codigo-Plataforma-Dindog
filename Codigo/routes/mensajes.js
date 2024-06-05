const express = require('express');
const multer = require('multer');
const router = express.Router();
const mensajesController = require('../controllers/mensajes');
const { isLoggedIn } = require('../middleware');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get('/', isLoggedIn, mensajesController.listarInteracciones);

router.get('/chat/:receptorId', isLoggedIn, mensajesController.verChatConUsuario);

router.post('/chat/:receptorId', upload.single('image'), isLoggedIn, mensajesController.enviarMensajeDesdeChat);

module.exports = router;
