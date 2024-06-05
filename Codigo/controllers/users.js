const User = require('../models/user');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const passport = require('passport');
const crypto = require('crypto');
require('dotenv').config();
const moment = require('moment');
require('moment/locale/es'); 
moment.locale('es');
const { cloudinary } = require("../cloudinary");
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

const validatePassword = (password) => {
    return password.length >= 6;
};


const sanitizeInput = (input) => {
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
    });
};
  

const sendVerificationEmail = async (user, req) => {
    const token = crypto.randomBytes(20).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 3600000; 
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const verificationUrl = `http://${req.headers.host}/verificarCorreo/${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Verificación de Email - Dindog',
        text: `Por favor, verifica tu email haciendo clic en el siguiente enlace: ${verificationUrl}`,
        html: `<p>Por favor, verifica tu email haciendo clic en el siguiente enlace:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
    };

    await transporter.sendMail(mailOptions);
};



exports.renderRegistroUsuario = (req, res) => {
    res.render('users/registerUser', { error: req.flash('error') });
};

exports.renderRegistroCuidador = (req, res) => {
    res.render('users/registerCuidador', { error: req.flash('error'), success: req.flash('success') });
};

exports.registerUser = async (req, res) => {
    try {
        const { email, username, password, passwordConfirm, nombre, telefono, ciudad, pais, codigoPostal, direccion, datosPerro } = req.body;
        const ubicacion = { ciudad, pais, codigoPostal, direccion };

        const sanitizedEmail = sanitizeHtml(email);
        const sanitizedUsername = sanitizeHtml(username);
        const sanitizedNombre = sanitizeHtml(nombre);
        const sanitizedTelefono = sanitizeHtml(telefono);
        const sanitizedCiudad = sanitizeHtml(ciudad);
        const sanitizedPais = sanitizeHtml(pais);
        const sanitizedCodigoPostal = sanitizeHtml(codigoPostal);
        const sanitizedDireccion = sanitizeHtml(direccion);
        const sanitizedDatosPerro = {
            nombre: sanitizeHtml(datosPerro.nombre),
            raza: sanitizeHtml(datosPerro.raza),
            edad: sanitizeHtml(datosPerro.edad),
        };

        if (password !== passwordConfirm) {
            req.flash('error', 'Las contraseñas no coinciden.');
            return res.redirect('/registro/usuario');
        }

        if (!validatePassword(password)) {
            req.flash('error', 'La contraseña debe tener al menos 6 caracteres.');
            return res.redirect('/registro/usuario');
        }

        const existingUser = await User.findOne({ $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }] });
        if (existingUser) {
            if (existingUser.email === sanitizedEmail) {
                req.flash('error', 'El correo electrónico ya está registrado.');
            }
            if (existingUser.username === sanitizedUsername) {
                req.flash('error', 'El nombre de usuario ya está registrado.');
            }
            return res.redirect('/registro/usuario');
        }

        const newUser = new User({ 
            email: sanitizedEmail, 
            username: sanitizedUsername, 
            nombre: sanitizedNombre, 
            telefono: sanitizedTelefono, 
            ubicacion: {
                ciudad: sanitizedCiudad,
                pais: sanitizedPais,
                codigoPostal: sanitizedCodigoPostal,
                direccion: sanitizedDireccion
            }, 
            datosPerro: sanitizedDatosPerro, 
            verified: false 
        });

        if (req.files && req.files['userImage']) {
            newUser.userImage = {
                url: req.files['userImage'][0].path,
                filename: req.files['userImage'][0].filename
            };
        }

        if (req.files && req.files['dogImage']) {
            newUser.datosPerro.image = {
                url: req.files['dogImage'][0].path,
                filename: req.files['dogImage'][0].filename
            };
        }

        const registeredUser = await User.register(newUser, password);

        await sendVerificationEmail(registeredUser, req);

        req.flash('success', '¡Registro exitoso! Por favor verifica tu email.');
        res.redirect('/verificarCorreo');
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/registro/usuario');
    }
};

const axios = require('axios'); 

const geocodeAddress = async (address) => {
    const apiKey = process.env.GOOGLE_API_KEY; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.status === 'OK') {
            const { lat, lng } = data.results[0].geometry.location;
            return { lat, lng };
        } else {
            throw new Error('No se pudo geocodificar la dirección.');
        }
    } catch (error) {
        console.error('Error al geocodificar la dirección:', error);
        throw new Error('Error al geocodificar la dirección.');
    }
};

exports.registerCuidador = async (req, res) => {
    try {
        const { email, username, password, passwordConfirm, nombre, telefono, ciudad, pais, codigoPostal, direccion, servicios, precio, horario } = req.body;
        
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedUsername = sanitizeInput(username);
        const sanitizedNombre = sanitizeInput(nombre);
        const sanitizedTelefono = sanitizeInput(telefono);
        const sanitizedCiudad = sanitizeInput(ciudad);
        const sanitizedPais = sanitizeInput(pais);
        const sanitizedCodigoPostal = sanitizeInput(codigoPostal);
        const sanitizedDireccion = sanitizeInput(direccion);
        const sanitizedHorario = sanitizeInput(horario);

        if (password !== passwordConfirm) {
            req.flash('error', 'Las contraseñas no coinciden.');
            return res.redirect('/registro/cuidador');
        }

        if (!validatePassword(password)) {
            req.flash('error', 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra minúscula, una letra mayúscula, un número y un símbolo.');
            return res.redirect('/registro/cuidador');
        }

        if (!req.file) {
            req.flash('error', 'La imagen es obligatoria para cuidadores.');
            return res.redirect('/registro/cuidador');
        }

        const addressComponents = [sanitizedDireccion, sanitizedCiudad, sanitizedPais, sanitizedCodigoPostal];
        const fullAddress = addressComponents.filter(component => component).join(', ');

        const { lat, lng } = await geocodeAddress(fullAddress);

        let serviciosArray = [];
        if (Array.isArray(servicios)) {
            servicios.forEach((servicio, index) => {
                serviciosArray.push({
                    tipo: sanitizeInput(servicio),
                    precio: precio[index]
                });
            });
        } else {
            serviciosArray.push({ tipo: sanitizeInput(servicios), precio: precio });
        }

        const newUser = new User({
            email: sanitizedEmail,
            username: sanitizedUsername,
            nombre: sanitizedNombre,
            telefono: sanitizedTelefono,
            ubicacionCuidador: { lat, lng },
            direccionStr: fullAddress,
            servicios: serviciosArray,
            horario: sanitizedHorario,
            esCuidador: true,
            verified: false,
            image: { url: req.file.path, filename: req.file.filename }
        });

        const registeredUser = await User.register(newUser, password);
        await sendVerificationEmail(registeredUser, req);

        req.flash('success', 'Registro exitoso. Por favor verifica tu email.');
        res.redirect('/verificarCorreo');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Hubo un problema al registrar al cuidador.');
        res.redirect('/registro/cuidador');
    }
};

exports.verificarCorreo = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'El enlace de verificación es inválido o ha expirado.');
        return res.redirect('/login');
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    req.flash('success', 'Email verificado con éxito. Ahora puedes iniciar sesión.');
    res.redirect('/login');
};


exports.renderLogin = (req, res) => {
    res.render('users/login');
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message); 
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Bienvenido de nuevo!');
            if (user.isAdmin) {
                return res.redirect('/admin');  
            }
            const redirectUrl = req.session.returnTo || '/';
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        });
    })(req, res, next);
};



exports.logout = (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success', "¡Hasta la próxima!");
        res.redirect('/');
    });
};

exports.listCuidadores = async (req, res) => {
    const precioMax = req.query.precioMax ? parseInt(req.query.precioMax) : undefined;
    const tipoServicio = req.query.tipoServicio; 
    const location = req.query.location; 

    let query = { esCuidador: true };

    if (precioMax) {
        query['servicios.precio'] = { $lte: precioMax };
    }

    if (tipoServicio) {
        if (Array.isArray(tipoServicio)) {
            query['servicios.tipo'] = { $in: tipoServicio };
        } else {
            query['servicios.tipo'] = tipoServicio;
        }
    }

    if (location) {
        query['ubicacion.ciudad'] = new RegExp(location, 'i'); 
    }

    try {
        const cuidadores = await User.find(query).populate('reviews').exec();
        console.log("Cuidadores encontrados:", cuidadores); 
        res.render('cuidadores/index', { cuidadores });
    } catch (error) {
        console.error("Error al obtener cuidadores:", error);
        res.status(500).send("Error al obtener cuidadores de la base de datos.");
    }
};



exports.showCuidador = async (req, res) => {
    try {
        const cuidador = await User.findById(req.params.id)
            .populate({
                path: 'reviews', 
                populate: {
                    path: 'author',
                    model: 'User' 
                }
            });

        if (!cuidador) {
            req.flash('error', 'Cuidador no encontrado');
            return res.redirect('/cuidadores');
        }

        res.render('cuidadores/mostrar', { cuidador, moment}); 
    } catch (error) {
        console.error("Error al cargar la información del cuidador: ", error);
        req.flash('error', 'Error interno al intentar acceder a los detalles del cuidador.');
        return res.redirect('/cuidadores');
    }
};

exports.editCuidador = async (req, res) => {
    const cuidador = await User.findById(req.params.id);
    if (!cuidador) {
        req.flash('error', 'Cuidador no encontrado');
        return res.redirect('/cuidadores');
    }
    res.render('cuidadores/edit', { cuidador });
};

exports.updateCuidador = async (req, res) => {
    const { id } = req.params;
    const { nombre, servicios, horario, direccion } = req.body;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion)}&format=json`);
    const data = await response.json();
    if (data.length > 0) {
        const { lat, lon } = data[0];
        const updatedData = {
            nombre,
            direccionStr: direccion,
            ubicacionCuidador: { lat, lng: lon },
            servicios: services.map(srv => ({ tipo: srv.tipo, precio: srv.precio, descripcion: srv.descripcion })),
            horario,
            ...(req.file ? { image: { url: req.file.path, filename: req.file.filename } } : {})
        };
        await User.findByIdAndUpdate(id, updatedData, { new: true });
        req.flash('success', '¡Cuidador actualizado exitosamente!');
        res.redirect(`/cuidadores/${id}`);
    } else {
        req.flash('error', 'No se pudieron encontrar las coordenadas para la dirección proporcionada.');
        res.redirect(`/cuidadores/${id}/edit`);
    }
};

exports.deleteCuidador = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'Cuidador eliminado exitosamente.');
    res.redirect('/cuidadores');
};

exports.showPerfil = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Debes estar logueado para ver esta página.');
        return res.redirect('/login');
    }
    
    try {
        const usuario = await User.findById(req.user._id);
        res.render('perfil', { usuario });
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        req.flash('error', 'Hubo un problema al obtener la información del perfil.');
        res.redirect('/');
    }
};

exports.showEditarPerfil = async (req, res) => {
    try {
        const usuario = await User.findById(req.user._id);
        res.render('editar-perfil', { usuario });
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        req.flash('error', 'Hubo un problema al cargar la página de edición.');
        return res.redirect('/perfil');
    }
};

exports.editarPerfil = async (req, res) => {
    const { nombre, username, email, password, confirmPassword } = req.body;
    
    try {
        const usuario = await User.findById(req.user._id);
        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                req.flash('error', 'Las contraseñas no coinciden.');
                return res.redirect('/editar-perfil');
            } else {
                await usuario.setPassword(password);
            }
        }
        
        usuario.nombre = nombre;
        usuario.username = username;
        usuario.email = email;

        if (usuario.esCuidador) {
            if (req.files && req.files.image) {
                const { path, filename } = req.files.image[0];
                usuario.image = { url: path, filename };
            }
        } else {
            if (req.files && req.files.userImage) {
                const { path, filename } = req.files.userImage[0];
                usuario.userImage = { url: path, filename };
            }
            
            if (req.files && req.files.dogImage) {
                const { path, filename } = req.files.dogImage[0];
                usuario.datosPerro.image = { url: path, filename };
            }
        }

        await usuario.save();

        req.login(usuario, err => {
            if (err) {
                req.flash('error', 'Hubo un problema reautenticando al usuario después de la actualización del perfil.');
                return res.redirect('/editar-perfil');
            }
            req.flash('success', 'Perfil actualizado con éxito.');
            res.redirect('/perfil');
        });
        
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        req.flash('error', 'Hubo un problema al actualizar el perfil.');
        return res.redirect('/editar-perfil');
    }
};



exports.buscarCuidadores = async (req, res) => {
    try {
        const { query } = req.query;
        const filtro = { esCuidador: true };  

        if (query) {
            filtro.$or = [
                { nombre: { $regex: query, $options: 'i' } },
                { 'ubicacion.ciudad': { $regex: query, $options: 'i' } },
                { 'servicios.tipo': { $regex: query, $options: 'i' } }
            ];
        }

        const cuidadores = await User.find(filtro);
        res.render('cuidadores/index', { cuidadores, esBusqueda: true });
    } catch (error) {
        req.flash('error', 'Error al buscar cuidadores.');
        res.redirect('back');
    }
};

exports.renderRecuperarContraseña = (req, res) => {
    res.render('users/recuperarContraseña', { error: req.flash('error') });
};

exports.enviarCorreoRecuperacion = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        req.flash('error', 'No se encontró ningún usuario con ese correo electrónico.');
        return res.redirect('/recuperar-password');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 3600000; 
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Restablecimiento de Contraseña - DinDog',
        text: `Puedes restablecer tu contraseña usando el siguiente enlace: http://${req.headers.host}/reset-password/${token}`
    };

    await transporter.sendMail(mailOptions);
    req.flash('success', 'Se ha enviado un enlace de recuperación a tu correo electrónico.');
    res.redirect('/recuperar-password');
};

exports.renderCambiarContraseña = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'El enlace de restablecimiento es inválido o ha expirado.');
        return res.redirect('/recuperar-password');
    }

    res.render('users/resetContraseña', { token, error: req.flash('error') });
};

exports.resetContraseña = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash('error', 'Las contraseñas no coinciden.');
        return res.redirect(`/reset-password/${token}`);
    }

    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'El enlace de restablecimiento es inválido o ha expirado.');
        return res.redirect('/recuperar-password');
    }

    await user.setPassword(password);
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    req.flash('success', 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.');
    res.redirect('/login');
};

exports.mostrarUsuario = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            req.flash('error', 'Usuario no encontrado');
            return res.redirect('/cuidadores');
        }
        res.render('users/show', { usuario });
    } catch (error) {
        console.error("Error al cargar la información del usuario: ", error);
        req.flash('error', 'Error interno al intentar acceder a los detalles del usuario.');
        return res.redirect('/cuidadores');
    }
};