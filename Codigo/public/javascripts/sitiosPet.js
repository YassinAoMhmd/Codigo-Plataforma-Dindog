
document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([35.889387, -5.321346], 14); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var comercioIcon = L.icon({
        iconUrl: '/iconos/icono-comercio.png',
        iconSize: [32, 32], 
        iconAnchor: [16, 32], 
        popupAnchor: [0, -32] 
    });

    var restauracionIcon = L.icon({
        iconUrl: '/iconos/icono-restauracion.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    var lugaresPetFriendly = [
        {lat: 35.89300032734956, lng: -5.321880000000309, name: "Super sport puerto", icon: comercioIcon},
        {lat: 35.89281167746852, lng: -5.321556691483237, name: "Sprinter", icon: comercioIcon},
        {lat: 35.893943257907765, lng: -5.3235148654351985, name: "Decathlon", icon: comercioIcon},
        {lat: 35.892093354114884, lng: -5.320927765148918, name: "Casa", icon: comercioIcon},
        {lat: 35.891107731483224, lng: -5.31844244116746, name: "Atleet", icon: comercioIcon},
        {lat: 35.88749684850986, lng: -5.309283466214288, name: "Ratan", icon: comercioIcon},
        {lat: 35.88888790926214,  lng: -5.309757611104643, name: "La meca", icon: comercioIcon},
        {lat: 35.88769986982759,  lng: -5.309762010308929, name: "Mundo móvil centro", icon: comercioIcon},
        {lat: 35.888341614369146,  lng: -5.3099687633083645, name: "Fariña", icon: comercioIcon},
        {lat: 35.887434666344326, lng: -5.309322437665363, name: "Natur house", icon: comercioIcon},
        {lat: 35.887337558721356,  lng: -5.30948119334149, name: "Top queens", icon: comercioIcon},
        {lat: 35.889046469403134,  lng: -5.315681736099129, name: "Mod-Alia", icon: comercioIcon},
        {lat: 35.88684099059774,  lng: -5.309156965583166, name: "Alexis Duran", icon: comercioIcon},
        {lat: 35.88695015996862,  lng: -5.309278222244241, name: "Iluminate", icon: comercioIcon},
        {lat: 35.886805560346794,  lng: -5.3094615222421115, name: "La rosa africana", icon: comercioIcon},
        {lat: 35.886682715147174,  lng: -5.309696910901116, name: "Tramas +", icon: comercioIcon},
        {lat: 35.8866687690607,  lng: -5.309860609225113, name: "Niágara", icon: comercioIcon},
        {lat: 35.888171579595536,  lng: -5.311740036396916, name: "Charol Zapatos", icon: comercioIcon},
        {lat: 35.88838189150184, lng: -5.310084917676043 , name: "ToyPlanet", icon: comercioIcon},
        {lat: 35.88702631495224,  lng: -5.3094991686832635, name: "Calzados Piccolo", icon: comercioIcon},
        {lat: 35.887148281727136,  lng: -5.309666307498837, name: "Balula kids", icon: comercioIcon},
        {lat: 35.88741489180954,  lng: -5.309384241060206, name: "Chocron", icon: comercioIcon},
        {lat: 35.88787548118756,  lng: -5.31040515198934, name: "Algo mas que vinos", icon: comercioIcon},
        {lat: 35.88792209859718,  lng: -5.312170056206723, name: "The corner shop", icon: comercioIcon},
        {lat: 35.88793332123294, lng:  -5.311091141540548, name: "Vista óptica", icon: comercioIcon},
        {lat: 35.894310989052954, lng:  -5.332945691612927, name: "San pablo", icon: comercioIcon},
        {lat: 35.888454142019995,  lng: -5.309534738684913, name: "Mimovil", icon: comercioIcon},
        {lat: 35.887750063449054,  lng: -5.308783745064738, name: "Estanco revellín", icon: comercioIcon},
        {lat: 35.88800867970478,  lng: -5.311508821874051, name: "Farmacia revellín", icon: comercioIcon},
        {lat: 35.88779018987761,  lng: -5.311601638959637, name: "In time", icon: comercioIcon},
        {lat: 35.88803673523066,  lng: -5.311516596179299, name: "Milar San pablo", icon: comercioIcon},
        {lat: 35.888129604138626, lng: -5.310254852832802, name: "Dewe", icon: comercioIcon},
        {lat: 35.88817551976277,  lng: -5.311784653400509, name: "Tous", icon: comercioIcon},
        {lat: 35.88809850509346,  lng: -5.3118400684053455, name: "Cortefiel", icon: comercioIcon},
        {lat: 35.888107827060814,  lng: -5.311884667009779, name: "Rossellimac", icon: comercioIcon},
        {lat: 35.88801101982204,  lng: -5.311954724503666, name: "Zara", icon: comercioIcon},
        {lat: 35.88808053494858, lng: -5.312302967290002, name: "Sfera", icon: comercioIcon},
        {lat: 35.89425740884041, lng: -5.329384024503037 , name: "Parfois", icon: comercioIcon},
        {lat: 35.895714746230055,  lng: -5.3292509646392405, name: "Inside", icon: comercioIcon},
        {lat: 35.887610789594376,  lng: -5.307870452271186, name: "Massimo dutti", icon: comercioIcon},
        {lat: 35.887623742632016, lng:  -5.307908021677324 , name: "Galés-Fabiola", icon: comercioIcon},
        {lat: 35.887704243559895,  lng: -5.307805396462847, name: "JD", icon: comercioIcon},
        {lat: 35.8876035818097,  lng: -5.307304051987822, name: "Misako", icon: comercioIcon},
        {lat: 35.889109924933095, lng:  -5.304460109224292, name: "Bazar Oriental", icon: comercioIcon},
        {lat: 35.89129893789356,  lng: -5.303101626530521, name: "Biga Bubble", icon: comercioIcon},
        {lat: 35.890831024136034,  lng: -5.30427016923217, name: "Automoto Yamaha", icon: comercioIcon},
        {lat: 35.89043043178301,  lng: -5.305066125069391, name: "Peugeot", icon: comercioIcon},
        {lat: 35.88959410213801,  lng: -5.307741868405682, name: "Manualidades Africa", icon: comercioIcon},
        {lat: 35.88885376353837, lng: -5.309595509223619 , name: "Italcar Ceuta Nissan", icon: comercioIcon},
        {lat: 35.88862520224319,  lng: -5.311225437256227, name: "Intersport Empire", icon: comercioIcon},
        {lat: 35.888544556667064, lng: -5.312228737845401 , name: "Aquarina perfumería", icon: comercioIcon},
        {lat: 35.888331311626736,  lng: -5.3060321531185375, name: "Nutri stand", icon: comercioIcon},
        {lat: 35.888618762775515,  lng: -5.305599635824682, name: "Mi Deskanso", icon: comercioIcon},
        {lat: 35.882324815842246,  lng: -5.329506381726912, name: "Salistre", icon: comercioIcon},
        {lat: 35.88761048088817,  lng: -5.307896837851539, name: "Confecciones cutillas", icon: comercioIcon},
        {lat: 35.88773616584405,  lng: -5.3070069330042315, name: "Milano store", icon: comercioIcon},
        {lat: 35.88813850048905,  lng: -5.309684994615281, name: "Casa blanca", icon: comercioIcon},
        {lat: 35.888601150416186,  lng: -5.3054496256353545, name: "La tienda de Mois", icon: comercioIcon},
        {lat: 35.88910461941427,  lng: -5.305174451821895, name: "Encuentro", icon: comercioIcon},
        {lat: 35.89210509823992,  lng: -5.30343262930868, name: "APP", icon: comercioIcon},
        {lat: 35.89005188399916,  lng: -5.302797623374858, name: "Eléctronica Elven", icon: comercioIcon},
        {lat: 35.8914214987472,  lng: -5.30353749729815, name: "La boutique de la limpieza", icon: comercioIcon},
        {lat: 35.8907116067284,  lng: -5.304141395332089, name: "Irema", icon: comercioIcon},
        {lat: 35.89042410524389,  lng: -5.306930941588068, name: "Benelis outlet", icon: comercioIcon},
        {lat: 35.88868271027492,  lng: -5.310884066435816, name: "Lua", icon: comercioIcon},
        {lat: 35.888203067355924,  lng: -5.315516012849766, name: "Foot on mars", icon: comercioIcon},
        {lat: 35.88831714268605,  lng: -5.310280696464117, name: "Papeleria Imperial", icon: comercioIcon},
        {lat: 35.88826438957844,  lng: -5.310249440401915, name: "Hello Kity", icon: comercioIcon},
        {lat: 35.8875326250748,  lng: -5.309475345206571, name: "Fariña", icon: comercioIcon},
        {lat: 35.88769517404074,  lng: -5.309721380608488, name: "J.M. Blau", icon: comercioIcon},
        {lat: 35.88771548087926,  lng: -5.310464265294912, name: "Quico", icon: comercioIcon},
        {lat: 35.88713009064899, lng: -5.30927455227394, name: "Fragancia shop", icon: comercioIcon},
        {lat: 35.88676011385856,  lng: -5.3096904664362405, name: "Maribel perfumería", icon: comercioIcon},
        
        //RESTAURACION

        {lat: 35.891434387574506,  lng: -5.318342821388202, name: "Coffe time", icon: restauracionIcon},
        {lat: 35.89157308111457,  lng: -5.318886181168183, name: "MANHATTAN", icon: restauracionIcon},
        {lat: 35.91621421333369,  lng: -5.371688538971275, name: "La terraza del estrecho", icon: restauracionIcon},
        {lat: 35.896112230633754,  lng: -5.326512380908106, name: "El portuario", icon: restauracionIcon},
        {lat: 35.88730855788262,  lng: -5.3093555777324974, name: "Apolo", icon: restauracionIcon},
        {lat: 35.88740853727513,  lng: -5.309349252619639, name: "Natur house", icon: restauracionIcon},
        {lat: 35.886632514320766,  lng: -5.311258995329198, name: "Casa pepe", icon: restauracionIcon},
        {lat: 35.886679822163984, lng: -5.311463924508656 , name: "Burguer gourmet", icon: restauracionIcon},
        {lat: 35.88786097949713,  lng: -5.310079694131488, name: "Granier", icon: restauracionIcon},
        {lat: 35.88764738927744,  lng: -5.309688723374168, name: "Ulises", icon: restauracionIcon},
        {lat: 35.88762206092083,  lng: -5.309640650988942, name: "Columnas Ulises", icon: restauracionIcon},
        {lat: 35.88687454546145,  lng: -5.309898182155952, name: "Oficina Correos", icon: restauracionIcon},
        {lat: 35.887775489684465,  lng: -5.310328210063505, name: "D'Armando teniente ruiz", icon: restauracionIcon},
        {lat: 35.886556706253224,  lng: -5.325305936119758, name: "Bazar china", icon: restauracionIcon},
        {lat: 35.891825086372585,  lng: -5.3026213841816725, name: "Bar dos hermanos", icon: restauracionIcon},
        {lat: 35.890953314436665,  lng: -5.304036095614239, name: "Velero", icon: restauracionIcon},
        {lat: 35.88826429533279,  lng: -5.305890265864233, name: "La carnicería de tomás", icon: restauracionIcon}
];

    lugaresPetFriendly.forEach(function(lugar) {
        L.marker([lugar.lat, lugar.lng], {icon: lugar.icon})
            .addTo(map)
            .bindPopup('<b>' + lugar.name + '</b>')
            .openPopup();
    });

    var markers = [];
    var placesList = document.getElementById('places-list');

    lugaresPetFriendly.forEach(function(lugar) {
        var marker = L.marker([lugar.lat, lugar.lng], {icon: lugar.icon})
            .addTo(map)
            .bindPopup('<b>' + lugar.name + '</b>');

        markers.push({ marker: marker, name: lugar.name.toLowerCase() });

        var li = document.createElement('li');
        li.textContent = lugar.name;
        li.dataset.name = lugar.name.toLowerCase(); 
        li.onclick = function() {
            map.setView([lugar.lat, lugar.lng], 18);
            marker.openPopup();
        };
        placesList.appendChild(li);
    });

    window.filterPlaces = function() {
        var input = document.getElementById('search-input');
        var filter = input.value.toLowerCase();
        var places = placesList.getElementsByTagName('li');

        for (var i = 0; i < places.length; i++) {
            var place = places[i];
            var txtValue = place.dataset.name;
            if (txtValue.indexOf(filter) > -1) {
                place.style.display = "";
                markers[i].marker.addTo(map); 
            } else {
                place.style.display = "none";
                map.removeLayer(markers[i].marker); 
            }
        }
    };
});
