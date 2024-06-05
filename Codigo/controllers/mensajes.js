const Mensaje = require('../models/mensaje');
const User = require('../models/user');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const enviarCorreoNotificacion = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email enviado correctamente');
    } catch (error) {
        console.error('Error mandando el email:', error);
    }
};

exports.listarInteracciones = async (req, res) => {
    try {
        const mensajes = await Mensaje.find({
            $or: [{ de: req.user._id }, { para: req.user._id }]
        }).populate('de para', 'nombre email esCuidador image');

        const usuariosMap = new Map();
        mensajes.forEach(msg => {
            const otroUsuario = msg.de._id.toString() === req.user._id.toString() ? msg.para : msg.de;
            const usuarioExistente = usuariosMap.get(otroUsuario._id.toString());
            const fechaUltimoMensaje = msg.fecha;

            if (usuarioExistente) {
                if (new Date(fechaUltimoMensaje) > new Date(usuarioExistente.fechaUltimoMensaje)) {
                    usuarioExistente.fechaUltimoMensaje = fechaUltimoMensaje;
                }
                if (!msg.leido && msg.para.toString() === req.user._id.toString()) {
                    usuarioExistente.numMensajesNoLeidos = (usuarioExistente.numMensajesNoLeidos || 0) + 1;
                }
            } else {
                otroUsuario.fechaUltimoMensaje = fechaUltimoMensaje;
                otroUsuario.numMensajesNoLeidos = !msg.leido && msg.para.toString() === req.user._id.toString() ? 1 : 0;
                usuariosMap.set(otroUsuario._id.toString(), otroUsuario);
            }
        });

        const usuarios = Array.from(usuariosMap.values()).sort((a, b) => new Date(b.fechaUltimoMensaje) - new Date(a.fechaUltimoMensaje));

        res.render('mensajes/index', { usuarios });
    } catch (error) {
        req.flash('error', 'Error al obtener las conversaciones.');
        res.redirect('back');
    }
};

exports.enviarMensajeDesdeChat = async (req, res) => {
    try {
        const nuevoMensaje = new Mensaje({
            de: req.user._id,
            para: req.params.receptorId,
            fecha: new Date()
        });

        if (req.body.contenido) {
            nuevoMensaje.contenido = req.body.contenido;
        }
        if (req.file) {
            nuevoMensaje.imagen = req.file.path;
        }

        if (nuevoMensaje.contenido || nuevoMensaje.imagen) {
            await nuevoMensaje.save();

            const receptor = await User.findById(req.params.receptorId);
            if (receptor) {
                const subject = 'Nuevo mensaje recibido en DinDog';
                const text = `Hola ${receptor.nombre},\n\nHas recibido un nuevo mensaje de ${req.user.nombre}.\n\nInicia sesión en DinDog para leer tu mensaje.\n\nSaludos,\nEl equipo de DinDog`;
                await enviarCorreoNotificacion(receptor.email, subject, text);
            }

            receptor.numMensajesNoLeidos = (receptor.numMensajesNoLeidos || 0) + 1;
            await receptor.save();

            req.flash('success', 'Mensaje enviado con éxito.');
            res.redirect(`/mensajes/chat/${req.params.receptorId}`);
        } else {
            req.flash('error', 'No puedes enviar un mensaje vacío.');
            res.redirect(`/mensajes/chat/${req.params.receptorId}`);
        }
    } catch (error) {
        req.flash('error', 'Error al enviar el mensaje.');
        res.redirect(`/mensajes/chat/${req.params.receptorId}`);
    }
};

exports.verChatConUsuario = async (req, res) => {
    try {
        const mensajes = await Mensaje.find({
            $or: [
                { de: req.user._id, para: req.params.receptorId },
                { de: req.params.receptorId, para: req.user._id }
            ]
        }).populate('de para', 'nombre email image online').sort({ fecha: 1 });

        await Mensaje.updateMany(
            { para: req.user._id, de: req.params.receptorId, leido: false },
            { $set: { leido: true } }
        );

        const numMensajesNoLeidos = await Mensaje.countDocuments({ para: req.user._id, leido: false });
        res.locals.numMensajesNoLeidos = numMensajesNoLeidos;

        const mensajesInteracciones = await Mensaje.find({
            $or: [{ de: req.user._id }, { para: req.user._id }]
        }).populate('de para', 'nombre email image online');

        const contactosMap = new Map();
        mensajesInteracciones.forEach(msg => {
            const otroUsuario = msg.de._id.toString() === req.user._id.toString() ? msg.para : msg.de;
            contactosMap.set(otroUsuario._id.toString(), otroUsuario);
        });

        const contactos = Array.from(contactosMap.values());
        const receptor = contactos.find(contacto => contacto._id.toString() === req.params.receptorId);

        res.render('mensajes/chat', { mensajes, receptorId: req.params.receptorId, usuario: req.user, contactos, receptor });
    } catch (error) {
        req.flash('error', 'Error al cargar el chat.');
        res.redirect('back');
    }
};
