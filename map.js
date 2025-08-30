// Inizializza la mappa con una vista iniziale e livello di zoom
var map = L.map('map', {
    zoomDelta: 0.5,  // Rende lo zoom più lento
    wheelPxPerZoomLevel: 100  // Regola la velocità dello zoom con la rotella del mouse
}).setView([50, 10], 4);  // Imposta la posizione iniziale (al centro dell'Europa)

// Aggiungi il tile layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Dati delle città (capitali) europee
var cities = [
    { name: "Vienna", lat: 48.2082, lon: 16.3738 },
    { name: "Roma", lat: 41.9028, lon: 12.4964 },
    { name: "Berlino", lat: 52.5200, lon: 13.4050 },
    { name: "Madrid", lat: 40.4168, lon: -3.7038 },
    { name: "Parigi", lat: 48.8566, lon: 2.3522 },
    { name: "Londra", lat: 51.5074, lon: -0.1278 },
    { name: "Bruxelles", lat: 50.8503, lon: 4.3517 },
    { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
    { name: "Lisbona", lat: 38.7169, lon: -9.1395 },
    { name: "Oslo", lat: 59.9139, lon: 10.7522 },
    { name: "Stoccolma", lat: 59.3293, lon: 18.0686 },
    { name: "Helsinki", lat: 60.1692, lon: 24.9384 },
    { name: "Copenaghen", lat: 55.6761, lon: 12.5683 },
    { name: "Varsavia", lat: 52.2298, lon: 21.0122 },
    { name: "Atene", lat: 37.9838, lon: 23.7275 },
    { name: "Budapest", lat: 47.4979, lon: 19.0402 },
    { name: "Praga", lat: 50.0755, lon: 14.4208 },
    { name: "Belgrado", lat: 44.8176, lon: 20.4633 },
    { name: "Bucarest", lat: 44.4268, lon: 26.1025 },
    { name: "Sofia", lat: 42.6977, lon: 23.3219 },
    { name: "Zagabria", lat: 45.8131, lon: 15.9819 },
    { name: "Sarajevo", lat: 43.8486, lon: 18.4131 },
    { name: "Skopje", lat: 41.9981, lon: 21.7178 },
    { name: "Tirana", lat: 41.3275, lon: 19.8189 },
    { name: "Chisinau", lat: 47.0105, lon: 28.9794 },
    { name: "Podgorica", lat: 42.4411, lon: 19.2636 },
    { name: "Yerevan", lat: 44.4991, lon: 40.1792 },
    { name: "Baku", lat: 40.4093, lon: 49.8671 },
    { name: "Tbilisi", lat: 41.7151, lon: 44.7872 },
    { name: "Astana", lat: 51.1694, lon: 71.4196 },
    { name: "Luxemburgo", lat: 49.6116, lon: 6.13 },
    { name: "Monaco", lat: 43.7333, lon: 7.4167 }
];

// Aggiungi i marker per le capitali
var markersLayer = L.layerGroup();
cities.forEach(function(city) {
    var marker = L.marker([city.lat, city.lon]).addTo(markersLayer);
    marker.bindPopup("<b>" + city.name + "</b>");
});

// Aggiungi il menu di controllo per attivare/disattivare i layer (marker e confini)
var overlayMaps = {
    "Capitali": markersLayer
};

// Crea un gruppo per i poligoni (confini dei paesi)
var countriesLayer = L.layerGroup();

// Carica il file GeoJSON dei confini dei paesi europei dal repository GitHub
fetch('https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson?short_path=e6b7b33')
    .then(response => response.json())
    .then(data => {
        // Aggiungi i poligoni dei paesi alla mappa
        L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: "blue",    // Colore del confine
                    weight: 2,        // Spessore del confine
                    opacity: 0.7,     // Opacità del confine
                    fillColor: "green",  // Colore di riempimento
                    fillOpacity: 0.2  // Opacità del riempimento
                };
            },
            onEachFeature: function (feature, layer) {
                // Aggiungi pop-up con il nome del paese
                layer.bindPopup('<b>' + feature.properties.name + '</b>');
            }
        }).addTo(countriesLayer);  // Aggiungi i poligoni al layer
    })
    .catch(error => {
        console.log('Errore nel caricamento del file GeoJSON: ', error);
    });

// Aggiungi il controllo per i layer (poligoni e marker)
L.control.layers(null, overlayMaps).addTo(map);

// Aggiungi entrambi i layer alla mappa (inizialmente visibili)
markersLayer.addTo(map);
countriesLayer.addTo(map);

// Impostazioni per il comportamento della mappa (zoom, drag, ecc.)
map.on('click', function(e) {
    console.log("Coordinate cliccate: " + e.latlng.lat + ", " + e.latlng.lng);
});
