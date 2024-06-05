const Review = require('../models/review'); 

exports.listarReseña = async (req, res) => {
    try {
        const reviews = await Review.find({}).populate('author');
        const validReviews = reviews.filter(review => review.author !== null);
        res.render('admin/reviews/list', { reviews: validReviews }); 
    } catch (error) {
        console.error('Error al cargar las reseñas:', error);
        req.flash('error', 'Error al cargar las reseñas.');
        res.redirect('/admin');
    }
};

exports.eliminarReseña = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Reseña no encontrada.' });
        }
        res.status(200).json({ message: 'Reseña eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar la reseña:', error);
        res.status(500).json({ error: 'Error al eliminar la reseña.' });
    }
};

exports.mostrarDetallesReseña = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id).populate('author');
        if (!review) {
            req.flash('error', 'Reseña no encontrada.');
            return res.redirect('/admin/reviews');
        }
        res.render('admin/reviews/details', { review }); 
    } catch (error) {
        console.error('Error al mostrar la reseña:', error);
        req.flash('error', 'Error al cargar los detalles de la reseña.');
        res.redirect('/admin/reviews');
    }
};
