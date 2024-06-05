const User = require('../models/user');
const Reserva = require('../models/reserva');

exports.mostrarEstadisticasGenerales = async (req, res) => {
    try {
        const numUsuarios = await User.countDocuments();
        const numReservas = await Reserva.countDocuments();
        const estadisticas = {
            numUsuarios,
            numReservas,
        };
        res.render('admin/estadisticas/general', { estadisticas }); 
    } catch (error) {
        req.flash('error', 'Error al cargar las estadísticas generales.');
        res.redirect('/admin');
    }
};


exports.mostrarEstadisticasUsuarios = async (req, res) => {
    try {
        const totalUsuarios = await User.countDocuments(); 
        const usuariosActivos = await User.find({ active: true }).countDocuments(); 
        const totalCuidadores = await User.countDocuments({ esCuidador: true }); 
        const usuariosComunes = totalUsuarios - totalCuidadores; 

        res.render('admin/estadisticas/usuarios', {
            totalUsuarios,
            usuariosActivos,
            totalCuidadores,
            usuariosComunes
        });
    } catch (error) {
        console.error('Error al cargar las estadísticas de usuarios:', error);
        req.flash('error', 'Error al cargar las estadísticas de usuarios activos.');
        res.redirect('/admin/general');
    }
};

exports.mostrarEstadisticasReserva = async (req, res) => {
    try {
        const totalReservas = await Reserva.countDocuments(); 
        const reservasActivas = await Reserva.countDocuments({ estado: 'activa' });
        const reservasCompletadas = await Reserva.countDocuments({ estado: 'completada' });
        const reservasCanceladas = await Reserva.countDocuments({ estado: 'cancelada' });
        
        const year = new Date().getFullYear();
        const reservasPorMes = [];
        for (let month = 0; month < 12; month++) {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            const count = await Reserva.countDocuments({
                fechaInicio: { $gte: start, $lte: end }
            });
            reservasPorMes.push(count);
        }

        res.render('admin/estadisticas/reservas', {
            totalReservas,
            reservasActivas,
            reservasCompletadas,
            reservasCanceladas,
            reservasPorMes 
        });
    } catch (error) {
        console.error('Error al cargar las estadísticas de reservas:', error);
        req.flash('error', 'Error al cargar las estadísticas de reservas.');
        res.redirect('/admin/general');
    }
};

