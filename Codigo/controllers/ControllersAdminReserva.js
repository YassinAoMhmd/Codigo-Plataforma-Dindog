const Reserva = require('../models/reserva'); 

exports.listarReservas = async (req, res) => {
    try {
        const reservas = await Reserva.find({}).populate('usuario').populate('cuidador');
        res.render('admin/reservas', { reservas }); 
    } catch (error) {
        req.flash('error', 'Error al cargar las reservas.');
        res.redirect('/admin');
    }
};

exports.actualizarEstadoReservas = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const actualizarReservas = await Reserva.findByIdAndUpdate(id, { estado }, { new: true });
        req.flash('success', 'El estado de la reserva ha sido actualizado.');
        res.redirect('/admin/reservas');
    } catch (error) {
        req.flash('error', 'Error al actualizar el estado de la reserva.');
        res.redirect('/admin/reservas');
    }
};

exports.eliminarReservas = async (req, res) => {
    const { id } = req.params;
    try {
        await Reserva.findByIdAndDelete(id);
        req.flash('success', 'Reserva eliminada correctamente.');
        res.redirect('/admin/reservas');
    } catch (error) {
        req.flash('error', 'Error al eliminar la reserva.');
        res.redirect('/admin/reservas');
    }
};
