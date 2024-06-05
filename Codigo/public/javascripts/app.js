/*document.addEventListener('DOMContentLoaded', () => {
    var map = L.map('map').setView([40.416775, -3.703790], 13); // Ejemplo: Madrid
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var socket = io();

    map.on('click', function(e) {
        var latlng = map.mouseEventToLatLng(e.originalEvent);
        socket.emit('location', { lat: latlng.lat, lng: latlng.lng });
        L.marker([latlng.lat, latlng.lng]).addTo(map);
    });

    socket.on('new-location', function(data) {
        L.marker([data.lat, data.lng]).addTo(map);
    });
});


var cuidadores = <%- JSON.stringify(cuidadores) %>; 

    var map = L.map('map').setView([40.416775, -3.703790], 13); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    cuidadores.forEach(function(cd) {
        if(cd.ubicacion) {
            L.marker([cd.ubicacion.lat, cd.ubicacion.lng]).addTo(map)
                .bindPopup('<b>' + cd.nombre + '</b><br/>' + cd.horario);
        }
    });

*/
