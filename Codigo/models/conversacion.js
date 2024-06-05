const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversacionSchema = new Schema({
  participantes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  mensajes: [{
    type: Schema.Types.ObjectId,
    ref: 'Mensaje'
  }]
});

const Conversacion = mongoose.model('Conversacion', conversacionSchema);

module.exports = Conversacion;
