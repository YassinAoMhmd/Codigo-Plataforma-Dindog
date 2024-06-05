function showPart2() {
    const part1Fields = document.querySelectorAll('#part1 input');
    let isValid = true;

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    const errorAlerts = document.querySelectorAll('.alert.alert-danger');
    errorAlerts.forEach(alert => alert.remove());

    if (password !== confirmPassword) {
        displayError('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
        return false;
    }

    if (!validatePassword(password)) {
        displayError('La contraseña debe tener al menos 6 caracteres.');
        return false;
    }

    part1Fields.forEach(field => {
        if (!field.checkValidity()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        displayError('Por favor, complete todos los campos obligatorios en la Parte 1.');
        return false;
    }

    document.getElementById('part1').style.display = 'none';
    document.getElementById('part2').style.display = 'block';
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateForm() {
    const formFields = document.querySelectorAll('#multiPartForm input');
    let isValid = true;
    formFields.forEach(field => {
        if (!field.checkValidity()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });

    const errorAlerts = document.querySelectorAll('.alert.alert-danger');
    errorAlerts.forEach(alert => alert.remove());

    if (!isValid) {
        displayError('Por favor, complete todos los campos obligatorios.');
        return false;
    }

    return true;
}

function updateCities() {
    const country = document.getElementById('pais').value;
    const citySelect = document.getElementById('ciudad');
    citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';

    const cities = {
        "España": [
            "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza",
            "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao",
            "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón",
            "L'Hospitalet de Llobregat", "A Coruña", "Vitoria-Gasteiz", "Granada", "Elche",
            "Oviedo", "Badalona", "Cartagena", "Terrassa", "Jerez de la Frontera",
            "Sabadell", "Móstoles", "Santa Cruz de Tenerife", "Pamplona", "Almería",
            "Alcalá de Henares", "Fuenlabrada", "Leganés", "Donostia-San Sebastián", "Burgos",
            "Santander", "Castellón de la Plana", "Albacete", "Getafe", "Alcorcón",
            "Logroño", "Badajoz", "Salamanca", "Huelva", "Marbella",
            "Lleida", "Tarragona", "León", "Cádiz", "Jaén",
            "Ourense", "Lugo", "Santiago de Compostela", "Girona", "Cáceres",
            "Melilla", "Ceuta"
        ]
    };

    if (cities[country]) {
        cities[country].forEach(function(city) {
            const option = document.createElement('option');
            option.value = city;
            option.text = city;
            citySelect.appendChild(option);
        });
    }
}

function displayError(message) {
    const errorAlert = document.createElement('div');
    errorAlert.className = 'alert alert-danger';
    errorAlert.textContent = message;
    document.getElementById('multiPartForm').prepend(errorAlert);
    setTimeout(() => errorAlert.remove(), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#multiPartForm input');

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                input.classList.remove('is-invalid');
            } else {
                input.classList.add('is-invalid');
            }
            const errorAlerts = document.querySelectorAll('.alert.alert-danger');
            errorAlerts.forEach(alert => alert.remove());
        });
    });
});
