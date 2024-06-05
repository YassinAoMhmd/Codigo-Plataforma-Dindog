const Joi = require('joi');

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        texto: Joi.string().required().min(0).messages({
            'string.base': `"texto" debe ser de tipo texto`,
            'string.empty': `"texto" no puede ser vacio `,
            'string.min': `"texto" debe tener al menos {#limit} caracteres`,
            'any.required': `"texto" es obligatorio`
        }),
        calificación: Joi.number().integer().min(1).max(5).required().messages({
            'number.base': `"calificación" debe ser un número`,
            'number.integer': `"calificación" debe ser un número entero`,
            'number.min': `"calificación" debe ser al menos {#limit}`,
            'number.max': `"calificación" no puede ser mayor que {#limit}`,
            'any.required': `"calificación" es obligatorio`
        })
    }).required()
});



