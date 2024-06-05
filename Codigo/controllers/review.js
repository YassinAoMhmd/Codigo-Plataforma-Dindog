const Review = require('../models/review.js');
const User = require('../models/user');

module.exports.crearReseña = async (req, res) => {
    const cuidador = await User.findById(req.params.id);
    if (!cuidador) {
        req.flash('error', 'Cuidador no encontrado.');
        return res.redirect('back');
    }
    const review = new Review({
        author: req.user._id,
        texto: req.body.review.texto,
        calificación: req.body.review.calificación
    });
    cuidador.reviews.push(review);
    await review.save();
    await cuidador.save();
    req.flash('success', 'Reseña añadida con éxito!');
    res.redirect(`/cuidadores/${cuidador._id}`);
};

module.exports.eliminarReseña = async (req, res) => {
    const { id, reviewId } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });  
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Reseña eliminada con éxito!');
    res.redirect(`/cuidadores/${id}`);
}
