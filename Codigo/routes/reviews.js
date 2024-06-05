const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const Review = require('../models/review.js');
const { validarReview, isLoggedIn, isAutorReview } = require('../middleware.js');
const ExpressError = require('../utils/ExpressError.js');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/review.js');

router.post('/', isLoggedIn, validarReview, catchAsync(reviews.crearReseña));

router.delete('/:reviewId', isLoggedIn, isAutorReview, catchAsync(reviews.eliminarReseña));

module.exports = router;
