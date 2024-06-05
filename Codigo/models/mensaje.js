const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mensajeSchema = new Schema({
  contenido: {
    type: String
  },
  imagen: {
    type: String
  },
  de: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  para: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversacion: {
    type: Schema.Types.ObjectId,
    ref: 'Conversacion'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  leido: { type: Boolean, default: false }
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

module.exports = Mensaje;




