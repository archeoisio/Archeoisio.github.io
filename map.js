// Crea la mappa centrata sull'Europa con uno zoom iniziale
var map = L.map('map').setView([51.1657, 10.4515], 4); // Latitudine e longitudine per il centro dell'Europa

// Aggiungi il layer OpenStreetMap come sfondo
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Carica il file geojson con le città e aggiungi i marker
fetch('data/locations.geojson')
    .then(response => response.json())
    .then(data => {
        // Aggiungi ogni feature del GeoJSON alla mappa
        data.features.forEach(function(feature) {
            var lat = feature.geometry.coordinates[1]; // Latitudine
            var lon = feature.geometry.coordinates[0]; // Longitudine
            var city = feature.properties.name;        // Nome della città
            var country = feature.properties.country;  // Paese della città

            // Crea il marker per ogni città
            var marker = L.marker([lat, lon]).addTo(map);

            // Aggiungi un pop-up personalizzato al marker
            marker.bindPopup(`<b>${city}</b><br>${country}`)
                .openPopup(); // Puoi rimuovere .openPopup() se non vuoi che il pop-up sia visibile subito
        });
    })
    .catch(error => {
        console.log("Errore nel caricamento del file geojson:", error);
    });
