const Reserva = require('../models/reserva');
const User = require('../models/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const enviarCorreoNotificacion = require('../config/emailConfig');
const moment = require('moment');
//const generarFactura = require('../utils/generarFactura');

exports.crearReserva = async (req, res) => {
    const { fechaInicio, horaInicio, fechaFin, horaFin, servicioTipo, precio, especificaciones, token } = req.body;
    const cuidadorId = req.params.cuidadorId;

    try {
        const cuidador = await User.findById(cuidadorId);

        const fechaInicioObj = new Date(`${fechaInicio}T${horaInicio}:00`);
        const fechaFinObj = new Date(`${fechaFin}T${horaFin}:00`);
        const ahora = new Date();

        if (fechaInicioObj < ahora || fechaFinObj < ahora) {
            req.flash('error', 'Las fechas no pueden ser en el pasado.');
            return res.redirect('back');
        }

        if (fechaFinObj < fechaInicioObj || (fechaFinObj.getTime() === fechaInicioObj.getTime() && horaFin <= horaInicio)) {
            req.flash('error', 'La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio.');
            return res.redirect('back');
        }

        const nuevaReserva = new Reserva({
            usuario: req.user._id,
            cuidador: cuidadorId,
            servicio: { tipo: servicioTipo, precio: parseFloat(precio) },
            fechaInicio: fechaInicioObj,
            fechaFin: fechaFinObj,
            horaInicio,
            horaFin,
            especificaciones,
            precioTotal: parseFloat(precio),
            stripeToken: token
        });

        await nuevaReserva.save();

        const emailText = `Has recibido una nueva solicitud de reserva para el servicio de ${servicioTipo}.
        Fecha de inicio: ${fechaInicio} a las ${horaInicio}
        Fecha de fin: ${fechaFin} a las ${horaFin}
        Precio Total: ${precio}€
        Especificaciones: ${especificaciones}`;

        await enviarCorreoNotificacion(cuidador.email, 'Nueva solicitud de reserva', emailText);

        req.flash('success', 'Reserva creada con éxito y notificación enviada al cuidador.');
        res.redirect('/reservas/mis-reservas');
    } catch (error) {
        console.error('Error al crear la reserva:', error);
        req.flash('error', 'No se pudo crear la reserva.');
        res.redirect('back');
    }
};


exports.mostrarFormularioReserva = async (req, res) => {
    const cuidadorId = req.params.cuidadorId;
    try {
        const cuidador = await User.findById(cuidadorId);
        res.render('reservas/nueva', { cuidador });
    } catch (error) {
        req.flash('error', 'No se pudo cargar el formulario de reserva.');
        res.redirect('back');
    }
};


exports.verReservasUsuario = async (req, res) => {
    try {
        const reservasRealizadas = await Reserva.find({ usuario: req.user._id }).populate('cuidador');
        
        const reservasRecibidas = await Reserva.find({ cuidador: req.user._id }).populate('usuario');

        const formattedReservasRealizadas = reservasRealizadas.map(reserva => ({
            ...reserva._doc,
            fechaInicioFormatted: moment(reserva.fechaInicio).format('DD/MM/YYYY'),
            horaInicioFormatted: moment(reserva.horaInicio, 'HH:mm').format('HH:mm'),
            fechaFinFormatted: moment(reserva.fechaFin).format('DD/MM/YYYY'),
            horaFinFormatted: moment(reserva.horaFin, 'HH:mm')
        }));

        const formattedReservasRecibidas = reservasRecibidas.map(reserva => ({
            ...reserva._doc,
            fechaInicioFormatted: moment(reserva.fechaInicio).format('DD/MM/YYYY'),
            horaInicioFormatted: moment(reserva.horaInicio, 'HH:mm').format('HH:mm'),
            fechaFinFormatted: moment(reserva.fechaFin).format('DD/MM/YYYY'),
            horaFinFormatted: moment(reserva.horaFin, 'HH:mm')
        }));

        res.render('reservas/mis-reservas', { 
            reservasRealizadas: formattedReservasRealizadas,
            reservasRecibidas: formattedReservasRecibidas 
        });
    } catch (error) {
        req.flash('error', 'No se pudieron cargar tus reservas.');
        res.redirect('back');
    }
};

exports.reservasPendientes = async (req, res) => {
    try {
        const reservas = await Reserva.find({ cuidador: req.user._id, estado: 'pendiente' }).populate('usuario');

        await Reserva.updateMany(
            { cuidador: req.user._id, estado: 'pendiente' },
            { $set: { leido: true } }
        );

        res.render('reservas/pendientes', { reservas });
    } catch (error) {
        req.flash('error', 'No se pudieron cargar las reservas pendientes.');
        res.redirect('back');
    }
};

const generarFactura = (reserva, cuidador, usuario) => {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'facturas', `${reserva.numeroFactura}.pdf`);

    try {
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(20).text('Factura', { align: 'center' });
        doc.fontSize(14).text(`Número de Factura: ${reserva.numeroFactura}`);
        doc.text(`Fecha de Expedición: ${new Date(reserva.fechaExpedicion).toLocaleDateString()}`);
        doc.text(`Servicio Reserva: ${cuidador.nombre}`);
        doc.text(`Nombre Emisor: ${cuidador.nombre}`);
        doc.text(`Domicilio Emisor: ${cuidador.direccionStr}`);
        doc.text(`Nombre Receptor: ${usuario.nombre}`);
        doc.text(`Domicilio Receptor: ${usuario.ubicacion.direccion}`);
        doc.text(`Descripción: Servicio de ${reserva.servicio.tipo}`);
        doc.text(`Base Imponible: ${reserva.precioTotal}`);
        doc.text(`Tipo Impositivo: 21%`);
        doc.text(`Cuota Tributaria: ${(reserva.precioTotal * 0.21).toFixed(2)}`);
        doc.text(`Precio Total: ${(reserva.precioTotal * 1.21).toFixed(2)}`);
        doc.text(`Fecha de Prestación del Servicio: ${new Date(reserva.fechaInicio).toLocaleDateString()}`);

        doc.end();

        return filePath;
    } catch (error) {
        console.error('Error generando la factura:', error);
        return null;
    }
};

exports.actualizarEstadoReserva = async (req, res) => {
    const { id } = req.params;
    const { estado, mensaje } = req.body;
    try {
        const reserva = await Reserva.findById(id).populate('usuario').populate('cuidador');

        if (!reserva) {
            req.flash('error', 'Reserva no encontrada.');
            return res.redirect('back');
        }

        reserva.estado = estado;
        reserva.fechaExpedicion = new Date();
        reserva.numeroFactura = `INV-${Date.now()}`;
        reserva.domicilioCuidador = reserva.cuidador.direccionStr;
        reserva.domicilioUsuario = reserva.usuario.ubicacion.direccion;
        await reserva.save();

        if (mensaje) {
            const nuevoMensaje = new Mensaje({
                contenido: mensaje,
                de: req.user._id,
                para: reserva.usuario._id,
                fecha: new Date(),
                leido: false
            });
            await nuevoMensaje.save();
        }

        const filePath = generarFactura(reserva, reserva.cuidador, reserva.usuario);

        if (!filePath) {
            req.flash('error', 'Error al generar la factura.');
            return res.redirect('back');
        }

        const emailText = `Tu reserva para el servicio de ${reserva.servicio.tipo} ha sido ${estado === 'aceptada' ? 'aceptada' : 'rechazada'}.
        Fecha de inicio: ${new Date(reserva.fechaInicio).toLocaleDateString()} a las ${reserva.horaInicio}
        Fecha de fin: ${new Date(reserva.fechaFin).toLocaleDateString()} a las ${reserva.horaFin}
        Precio Total: ${(reserva.precioTotal * 1.21).toFixed(2)}€`;

        const emailOptionsUsuario = {
            to: reserva.usuario.email,
            subject: `Reserva ${estado}`,
            text: emailText,
            attachments: [{
                filename: 'factura.pdf',
                path: filePath
            }]
        };

        const emailOptionsCuidador = {
            to: reserva.cuidador.email,
            subject: `Reserva ${estado}`,
            text: emailText,
            attachments: [{
                filename: 'factura.pdf',
                path: filePath
            }]
        };

        await enviarCorreoNotificacion(emailOptionsUsuario);
        await enviarCorreoNotificacion(emailOptionsCuidador);

        req.flash('success', `Reserva ${estado}.`);
        res.redirect('/reservas/pendientes');
    } catch (error) {
        console.error('Error al actualizar el estado de la reserva:', error);
        req.flash('error', 'No se pudo actualizar el estado de la reserva.');
        res.redirect('back');
    }
};

exports.cancelarReserva = async (req, res) => {
    const { id } = req.params;
    try {
        await Reserva.findByIdAndUpdate(id, { estado: 'cancelada' });
        req.flash('success', 'Reserva cancelada.');
        res.redirect('/reservas/mis-reservas');
    } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        req.flash('error', 'No se pudo cancelar la reserva.');
        res.redirect('back');
    }
};

exports.detalleReserva = async (req, res) => {
    const { id } = req.params;
    try {
        const reserva = await Reserva.findById(id).populate('usuario').populate('cuidador');
        res.render('reservas/detalles', { reserva });
    } catch (error) {
        console.error('Error al cargar la reserva:', error);
        req.flash('error', 'No se pudo cargar la reserva.');
        res.redirect('back');
    }
};

exports.pagarReserva = async (req, res) => {
    const reserva = await Reserva.findById(req.params.id).populate('cuidador');
    if (!reserva || reserva.estado !== 'aceptada') {
        req.flash('error', 'Reserva no encontrada o no aceptada.');
        return res.redirect('/reservas/mis-reservas');
    }
    res.render('reservas/pagar', { reserva });
};

exports.realizarPago = async (req, res) => {
    const { stripeToken } = req.body;
    const reserva = await Reserva.findById(req.params.id).populate('cuidador');

    if (!reserva || reserva.estado !== 'aceptada') {
        req.flash('error', 'Reserva no encontrada o no aceptada.');
        return res.redirect('/reservas/mis-reservas');
    }

    try {
        const charge = await stripe.charges.create({
            amount: reserva.precioTotal * 100,
            currency: 'eur',
            description: `Pago por reserva con ${reserva.cuidador.nombre}`,
            source: stripeToken,
        });

        reserva.estado = 'pagada';
        await reserva.save();

        const textoFactura = `Factura por el servicio de ${reserva.servicio.tipo}.
        Fecha de inicio: ${moment(reserva.fechaInicio).format('DD/MM/YYYY')} a las ${reserva.horaInicio}
        Fecha de fin: ${moment(reserva.fechaFin).format('DD/MM/YYYY')} a las ${reserva.horaFin}
        Precio Total: ${reserva.precioTotal}€
        
        Gracias por utilizar nuestros servicios.`;

        await enviarCorreoNotificacion(reserva.usuario.email, 'Factura de la reserva', textoFactura);

        req.flash('success', 'Pago realizado correctamente. Reserva confirmada.');
        res.redirect(`/reservas/${reserva._id}`);
    } catch (error) {
        console.error('Error procesando el pago:', error);
        req.flash('error', 'Error al procesar el pago. Intente nuevamente.');
        res.redirect(`/reservas/pagar/${reserva._id}`);
    }
};

