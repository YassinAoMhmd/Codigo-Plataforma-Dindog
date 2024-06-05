const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const suscriptoresSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true
    }
});

module.exports = mongoose.model('Suscriptor',suscriptoresSchema);