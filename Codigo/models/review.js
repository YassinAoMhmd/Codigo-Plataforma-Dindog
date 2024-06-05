const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    texto: {
        type: String
    },
    calificación: Number,
},{
        timestamps: true  
});

module.exports = mongoose.model('Review',reviewSchema)