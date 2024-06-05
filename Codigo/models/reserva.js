const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservaSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cuidador: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    servicio: { 
        tipo: { type: String, required: true },
        precio: { type: Number, required: true }
    },
    fechaInicio: { type: Date, required: true },
    horaInicio: { type: String, required: true }, 
    fechaFin: { type: Date, required: true },
    horaFin: { type: String, required: true }, 
    especificaciones: { type: String },
    estado: { type: String, enum: ['pendiente', 'aceptada', 'rechazada', 'cancelada', 'pagada'], default: 'pendiente' },
    precioTotal: { type: Number, required: true },
    leido: { type: Boolean, default: false },
    stripeToken: { type: String },
    numeroFactura: { type: String },
    fechaExpedicion: { type: Date },
    domicilioCuidador: { type: String },
    domicilioUsuario: { type: String }
});

const Reserva = mongoose.model('Reserva', reservaSchema);
module.exports = Reserva;
