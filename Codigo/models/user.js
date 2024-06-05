const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require('validator');

const UserSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Por favor, ingrese un correo electrónico válido'
        }
    },
    username: { type: String, required: true, unique: true, minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'], maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres'] },
    nombre: { type: String, required: true, minlength: [3, 'El nombre debe tener al menos 3 caracteres'], maxlength: [50, 'El nombre no puede tener más de 50 caracteres'] },
    telefono: { type: String, required: true },
    ubicacion: {
        ciudad: { type: String, maxlength: [50, 'La ciudad no puede tener más de 50 caracteres'] },
        pais: { type: String, maxlength: [50, 'El país no puede tener más de 50 caracteres'] },
        codigoPostal: { type: String, maxlength: [10, 'El código postal no puede tener más de 10 caracteres'] },
        direccion: { type: String, maxlength: [100, 'La dirección no puede tener más de 100 caracteres'] }
    },
    datosPerro: {
        nombre: { type: String, maxlength: [50, 'El nombre del perro no puede tener más de 50 caracteres'] },
        raza: { type: String, maxlength: [50, 'La raza del perro no puede tener más de 50 caracteres'] },
        edad: { type: Number, min: [0, 'La edad del perro no puede ser negativa'] },
        image: { url: String, filename: String }  
    },
    esCuidador: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    direccionStr: String,
    ubicacionCuidador: {
        lat: Number,
        lng: Number
    },
    servicios: [{
        tipo: { type: String, enum: ['paseo', 'transporte', 'cuidado a domicilio', 'productos a domicilio'] },
        precio: { type: Number, min: [0, 'El precio del servicio no puede ser negativo'] }
    }],
    horario: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    image: {
        url: {
            type: String,
            validate: {
                validator: function(value) {
                    if (this.esCuidador && (!value || value.trim().length === 0)) {
                        return false;
                    }
                    return true;
                },
                message: 'La imagen es obligatoria para cuidadores.'
            }
        },
        filename: String
    },
    userImage: { url: String, filename: String }, 
    online: {
        type: Boolean,
        default: false
    },
    verified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.methods.calcularMedia = function () {
    if (this.reviews.length === 0) {
        return 0;
    }
    const sum = this.reviews.reduce((total, review) => total + review.calificación, 0);
    return sum / this.reviews.length;
};

UserSchema.methods.calcularNumeroReviews = function () {
    return this.reviews.length;
};

module.exports = mongoose.model('User', UserSchema);
