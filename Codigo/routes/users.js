const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');

router.get('/registro/usuario', users.renderRegistroUsuario);
router.get('/registro/cuidador', users.renderRegistroCuidador);

router.post('/registro/usuario', upload.fields([{ name: 'userImage' }, { name: 'dogImage' }]), catchAsync(users.registerUser));
router.post('/registro/cuidador', upload.single('image'), catchAsync(users.registerCuidador));

router.get('/verificarCorreo/:token', catchAsync(users.verificarCorreo));
router.get('/verificarCorreo', (req, res) => {
    res.render('users/verificarCorreo');
});

router.get('/login', users.renderLogin);
router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), users.login);

router.get('/logout', users.logout);

router.get('/buscar-cuidadores', catchAsync(users.buscarCuidadores));
router.get('/cuidadores', catchAsync(users.listCuidadores));
router.get('/cuidadores/:id', catchAsync(users.showCuidador)); 

router.get('/perfil', isLoggedIn, catchAsync(users.showPerfil)); 
router.get('/editar-perfil', isLoggedIn, catchAsync(users.showEditarPerfil)); 
router.post('/editar-perfil', isLoggedIn, upload.fields([{ name: 'userImage' }, { name: 'dogImage' }, {name :'image'}]), catchAsync(users.editarPerfil)); 

router.get('/recuperar-password', users.renderRecuperarContraseña);
router.post('/recuperar-password', users.enviarCorreoRecuperacion);
router.get('/reset-password/:token', users.renderCambiarContraseña);
router.post('/reset-password/:token', users.resetContraseña);

router.get('/usuarios/:id', catchAsync(users.mostrarUsuario));

module.exports = router;
