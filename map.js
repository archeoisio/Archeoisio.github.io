// Inizializza la mappa con una vista iniziale e livello di zoom
var map = L.map('map', {
    zoomDelta: 0.5,  // Rende lo zoom più lento
    wheelPxPerZoomLevel: 100  // Regola la velocità dello zoom con la rotella del mouse
}).setView([48.8566, 2.3522], 3;  // Imposta la posizione iniziale (ad esempio, Parigi)

// Aggiungi il tile layer 8-bit (puoi usare OpenStreetMap o tile 8-bit)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Crea layer per marker e poligoni
var markerLayer = L.layerGroup().addTo(map);  // Creiamo un layer per i marker
var polygonLayer = L.layerGroup().addTo(map);  // Creiamo un layer per i poligoni

// Dati delle capitali (solo per i marker)
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

// Aggiungi i marker al layer dei marker
cities.forEach(function(city) {
    var marker = L.marker([city.lat, city.lon]).addTo(markerLayer);
    marker.bindPopup("<b>" + city.name + "</b>");
});

// Dati dei poligoni (esempio)
var countriesPolygons = {
   "Austria": L.polygon([
        [47.1, 9.5], [47.1, 17.5], [48.2, 17.5], [48.2, 9.5]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Italia": L.polygon([
        [37.5, 6.5], [37.5, 15.5], [45.5, 15.5], [45.5, 6.5]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Germania": L.polygon([
        [47.5, 5.5], [47.5, 15.0], [55.5, 15.0], [55.5, 5.5]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Spagna": L.polygon([
        [36.0, -9.0], [36.0, 3.0], [42.0, 3.0], [42.0, -9.0]
    ], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.3
    }),
    "Francia": L.polygon([
        [42.0, -5.0], [42.0, 9.0], [48.0, 9.0], [48.0, -5.0]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Regno Unito": L.polygon([
        [49.0, -8.0], [49.0, 2.0], [60.0, 2.0], [60.0, -8.0]
    ], {
        color: 'purple',
        fillColor: 'purple',
        fillOpacity: 0.3
    }),
    "Belgio": L.polygon([
        [50.5, 3.5], [50.5, 6.5], [52.0, 6.5], [52.0, 3.5]
    ], {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.3
    }),
    "Paesi Bassi": L.polygon([
        [50.5, 3.5], [50.5, 7.0], [53.5, 7.0], [53.5, 3.5]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Portogallo": L.polygon([
        [37.0, -9.5], [37.0, -6.0], [42.0, -6.0], [42.0, -9.5]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Norvegia": L.polygon([
        [58.0, 5.0], [58.0, 13.0], [71.0, 13.0], [71.0, 5.0]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Svezia": L.polygon([
        [56.0, 11.0], [56.0, 19.0], [69.0, 19.0], [69.0, 11.0]
    ], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.3
    }),
    "Finlandia": L.polygon([
        [60.0, 20.0], [60.0, 30.0], [70.0, 30.0], [70.0, 20.0]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Danimarca": L.polygon([
        [54.0, 7.0], [54.0, 15.0], [58.0, 15.0], [58.0, 7.0]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Polonia": L.polygon([
        [49.0, 14.0], [49.0, 24.0], [55.0, 24.0], [55.0, 14.0]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Grecia": L.polygon([
        [36.0, 19.0], [36.0, 28.0], [42.0, 28.0], [42.0, 19.0]
    ], {
        color: 'purple',
        fillColor: 'purple',
        fillOpacity: 0.3
    }),
    "Ungheria": L.polygon([
        [45.5, 16.0], [45.5, 23.0], [49.0, 23.0], [49.0, 16.0]
    ], {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.3
    }),
    "Repubblica Ceca": L.polygon([
        [48.5, 12.0], [48.5, 19.5], [52.0, 19.5], [52.0, 12.0]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Serbia": L.polygon([
        [43.0, 18.5], [43.0, 21.5], [46.0, 21.5], [46.0, 18.5]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Romania": L.polygon([
        [44.5, 20.5], [44.5, 30.0], [48.0, 30.0], [48.0, 20.5]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Bulgaria": L.polygon([
        [41.5, 22.5], [41.5, 28.5], [44.0, 28.5], [44.0, 22.5]
    ], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.3
    }),
    "Croazia": L.polygon([
        [43.0, 15.0], [43.0, 20.0], [46.0, 20.0], [46.0, 15.0]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Bosnia ed Erzegovina": L.polygon([
        [43.0, 15.5], [43.0, 19.0], [45.5, 19.0], [45.5, 15.5]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Macedonia del Nord": L.polygon([
        [41.5, 20.0], [41.5, 22.5], [42.5, 22.5], [42.5, 20.0]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Albania": L.polygon([
        [40.0, 19.5], [40.0, 21.5], [42.0, 21.5], [42.0, 19.5]
    ], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.3
    }),
    "Moldavia": L.polygon([
        [45.5, 26.0], [45.5, 30.0], [48.0, 30.0], [48.0, 26.0]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Montenegro": L.polygon([
        [42.5, 18.5], [42.5, 20.0], [43.5, 20.0], [43.5, 18.5]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Armenia": L.polygon([
        [40.0, 39.0], [40.0, 42.5], [41.5, 42.5], [41.5, 39.0]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Azerbaijan": L.polygon([
        [39.5, 45.0], [39.5, 51.0], [42.0, 51.0], [42.0, 45.0]
    ], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.3
    }),
    "Georgia": L.polygon([
        [41.0, 43.0], [41.0, 46.5], [43.0, 46.5], [43.0, 43.0]
    ], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3
    }),
    "Kazakhstan": L.polygon([
        [48.0, 50.0], [48.0, 87.0], [55.0, 87.0], [55.0, 50.0]
    ], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.3
    }),
    "Lussemburgo": L.polygon([
        [49.5, 5.5], [49.5, 7.5], [50.5, 7.5], [50.5, 5.5]
    ], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.3
    }),
    "Monaco": L.polygon([
        [43.7, 7.4], [43.7, 7.8], [44.0, 7.8], [44.0, 7.4]
    ], {
        color: 'purple',
        fillColor: 'purple',
        fillOpacity: 0.3
    })
};

// Aggiungi il controllo dei layer (interattivo)
L.control.layers({
    'Marker': markerLayer,
    'Poligoni': polygonLayer
}, {}).addTo(map);
