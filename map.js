// Inizializza la mappa
var map = L.map('map').setView([31.505, -0.09], 5);  // Cambia latitudine e longitudine iniziali come desideri

// Aggiungi il tile layer 8-bit per lo sfondo (puoi usare OpenStreetMap o tile 8-bit)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Dati delle città (sostituisci con le tue città e le loro coordinate)
var cities = [
    { name: "Roma", lat: 41.9028, lon: 12.4964 },
    { name: "Milano", lat: 45.4642, lon: 9.1900 },
    { name: "Parigi", lat: 48.8566, lon: 2.3522 },
    { name: "Berlino", lat: 52.5200, lon: 13.4050 },
    { name: "Londra", lat: 51.5074, lon: -0.1278 }
];

// Funzione per aggiungere i marker sulla mappa
cities.forEach(function(city) {
    var marker = L.marker([city.lat, city.lon]).addTo(map);
    marker.bindPopup("<b>" + city.name + "</b>").openPopup();
});

// Impostazioni per il comportamento della mappa (zoom, drag, ecc.)
map.on('click', function(e) {
    console.log("Coordinate cliccate: " + e.latlng.lat + ", " + e.latlng.lng);
});
