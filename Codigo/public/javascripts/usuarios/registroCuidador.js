document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');
    const inputs = form.querySelectorAll('input, select');

    form.addEventListener('submit', function(event) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;

        if (password !== confirmPassword) {
            event.preventDefault();
            event.stopPropagation();
            alert('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
            return;
        }

        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            form.classList.remove('was-validated');
        }
        form.classList.add('was-validated');
    }, false);

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                input.classList.remove('is-invalid');
            }
        });
    });
});
