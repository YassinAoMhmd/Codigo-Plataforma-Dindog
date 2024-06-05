const User = require('../models/user'); 

exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find({});
        res.render('admin/usuarios', { usuarios }); 
    } catch (error) {
        req.flash('error', 'Error al cargar los usuarios.');
        res.redirect('/admin');
    }
};

exports.mostrarUsuarioFormulario = async (req, res) => {
    res.render('admin/nuevoUsuario'); 
};

exports.crearUsuario = async (req, res) => {
    try {
        const { username, email, nombre, password, telefono, esCuidador, servicios, horario } = req.body.user;
        let serviciosArray = [];
        if (esCuidador === 'true' && servicios) {
            serviciosArray = servicios.split(',').map(service => {
                const [tipo, precio] = service.split(':');
                return { tipo: tipo.trim(), precio: parseFloat(precio) };
            });
        }

        const newUser = new User({
            username,
            email,
            nombre,
            telefono,
            esCuidador: esCuidador === 'true',
            servicios: serviciosArray,
            horario: esCuidador === 'true' ? horario : ''
        });
        
        User.register(newUser, password, (err, user) => {
            if (err) {
                console.error('Error mientra se registra el usuario:', err);
                req.flash('error', 'Error al crear el usuario: ' + err.message);
                return res.redirect('/admin/usuarios/new');
            }
            req.flash('success', 'Usuario creado correctamente.');
            res.redirect('/admin/usuarios');
        });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        req.flash('error', 'Error al crear el usuario: ' + error.message);
        res.redirect('/admin/usuarios/new');
    }
};

exports.mostrarEditFormulario = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            req.flash('error', 'Usuario no encontrado.');
            return res.redirect('/admin/usuarios');
        }
        const informacionAdicional = usuario.esCuidador ? { extraData: usuario.extraData } : {};
        res.render('admin/editarUsuario', { usuario, ...informacionAdicional });
    } catch (error) {
        req.flash('error', 'Error al encontrar el usuario.');
        res.redirect('/admin/usuarios');
    }
};

exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const actualizacionUsuario = req.body.user;
        if (req.body.user.esCuidador) {
            actualizacionUsuario.extraData = req.body.extraData;
        }
        const updatedUser = await User.findByIdAndUpdate(id, actualizacionUsuario, { new: true });
        req.flash('success', 'Usuario actualizado correctamente.');
        res.redirect('/admin/usuarios/${id}');
    } catch (error) {
        req.flash('error', 'Error al actualizar el usuario.');
        res.redirect(`/admin/usuarios/${id}/edit`);
    }
}

exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);  
        return res.status(500).json({ success: false, message: 'Error al eliminar el usuario.' });
    }
};

exports.mostrarDetallesUsuario = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) {
            req.flash('error', 'Usuario no encontrado.');
            return res.redirect('/admin/usuarios');
        }
        res.render('admin/detallesUsuarios', { usuario }); 
    } catch (error) {
        console.error("Error al mostrar el usuario:", error);
        req.flash('error', 'Error al cargar los detalles del usuario.');
        res.redirect('/admin/usuarios');
    }
};




