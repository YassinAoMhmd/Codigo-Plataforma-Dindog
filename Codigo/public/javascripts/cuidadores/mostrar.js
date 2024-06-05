document.addEventListener('DOMContentLoaded', function() {
    const estrellas = document.querySelectorAll('input[name="review[calificación]"]');
    const submitButton = document.getElementById('submitReview');

    estrellas.forEach(star => {
        star.addEventListener('change', function() {
            if (document.querySelector('input[name="review[calificación]"]:checked')) {
                submitButton.disabled = false;
            }
        });
    });
});
