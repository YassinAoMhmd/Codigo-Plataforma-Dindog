const { cuidadoresSchema, reviewSchema } = require('./schemas.js'); 
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');
const Reserva = require('./models/reserva');
const Mensaje = require('./models/mensaje')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Debes estar registrado');
        return res.redirect('/login');
    }
    next();
};

module.exports.isCuidador = (req, res, next) => {
    if (req.isAuthenticated() && req.user.esCuidador) {
        next();
    } else {
        req.flash('error', 'No tienes acceso a esta acción!!');
        return res.redirect('/'); 
    }
};

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash('error', 'No tienes permiso para realizar esta acción!!');
    return res.redirect('/');
};

module.exports.isAutorReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review || !review.author.equals(req.user._id)) {
        req.flash('error', 'No tienes permiso para hacer eso!!');
        return res.redirect('back');
    }
    next();
};

module.exports.validarReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
};
