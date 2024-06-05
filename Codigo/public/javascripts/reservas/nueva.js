
const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);
const elements = stripe.elements();
const style = {
    base: {
        color: "#32325d",
    },
};

const card = elements.create('card', {style: style});
card.mount('#card-element');

card.addEventListener('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

const form = document.getElementById('reservaForm');
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');
const horaInicio = document.getElementById('horaInicio');
const horaFin = document.getElementById('horaFin');
const formErrors = document.getElementById('form-errors');

const hoy = new Date().toISOString().split('T')[0];
fechaInicio.setAttribute('min', hoy);
fechaFin.setAttribute('min', hoy);

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const fechaInicioValue = new Date(fechaInicio.value);
    const fechaFinValue = new Date(fechaFin.value);
    const horaInicioValue = horaInicio.value;
    const horaFinValue = horaFin.value;
    const ahora = new Date();

    if (fechaInicioValue < ahora || fechaFinValue < ahora) {
        formErrors.textContent = 'Las fechas no pueden ser en el pasado.';
        formErrors.style.display = 'block';
        return;
    }

    if (fechaFinValue < fechaInicioValue || (fechaFinValue.getTime() === fechaInicioValue.getTime() && horaFinValue <= horaInicioValue)) {
        formErrors.textContent = 'La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio.';
        formErrors.style.display = 'block';
        return;
    }

    const cardholderName = document.getElementById('cardholder-name').value;

    stripe.createToken(card, {
        name: cardholderName,
    }).then(function(result) {
        if (result.error) {
            const errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            document.querySelector('input[name="token"]').value = result.token.id;

            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    fechaInicio: form.fechaInicio.value,
                    horaInicio: form.horaInicio.value,
                    fechaFin: form.fechaFin.value,
                    horaFin: form.horaFin.value,
                    servicioTipo: form.servicio.value,
                    especificaciones: form.especificaciones.value,
                    token: result.token.id,
                    cardholderName: cardholderName
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/reservas/mis-reservas';
                } else {
                    formErrors.textContent = data.message;
                    formErrors.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                formErrors.textContent = 'Error de red. Inténtalo de nuevo más tarde.';
                formErrors.style.display = 'block';
            });
        }
    });
});

const socket = io();

socket.on('nuevaReserva', (data) => {
    alert('Nueva reserva recibida: ' + data.message);
});
