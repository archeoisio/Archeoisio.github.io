// map.js

// 1. Dati delle capitali mondiali
var cities = [
  { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773 },
  { name: "Abuja",  lat:  9.0579, lon:  7.49508 },
  // … qui tutte le altre capitali …
];

// 2. Inizializzazione della mappa
var map = L.map('map', {
  center: [45, 30],
  zoom: 5,
  minZoom: 3,
  scrollWheelZoom: true
});

// 3. TileLayer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

// 4. Creazione del layerGroup per i marker
var markerLayer = L.layerGroup();
cities.forEach(function(city) {
  L.marker([city.lat, city.lon])
    .bindPopup("<b>" + city.name + "</b>")
    .on('click', function() {
      map.setView([city.lat, city.lon], 8);
    })
    .addTo(markerLayer);
});
markerLayer.addTo(map);  // layer acceso di default

// 5. Controllo "Home" (come prima)
var HomeControl = L.Control.extend({
  options: { position: 'topright' },
  onAdd: function(map) {
    var btn = L.DomUtil.create('button', 'leaflet-control-home');
    btn.innerHTML = '🏠';
    btn.title = 'Torna alla vista iniziale';
    btn.onclick = function() {
      map.setView([50, 20], 4);
    };
    return btn;
  }
});
map.addControl(new HomeControl());

// 6. Controllo personalizzato per togglare markerLayer
var CustomToggle = L.Control.extend({
  options: { position: 'topright' },
  onAdd: function(map) {
    // container principale
    var container = L.DomUtil.create('div', 'leaflet-bar custom-toggle');
    
    // stili inline per posizionamento al centro
    Object.assign(container.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      border: '1px solid #bbb',
      borderRadius: '4px',
      padding: '4px 8px',
      zIndex: 1000
    });

    // checkbox
    var checkbox = L.DomUtil.create('input', '', container);
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.id = 'chkCapitals';
    checkbox.style.marginRight = '6px';

    // label
    var label = L.DomUtil.create('label', '', container);
    label.htmlFor = 'chkCapitals';
    label.innerText = 'Capitali';

    // disabilita la propagazione del click alla mappa
    L.DomEvent.disableClickPropagation(container);

    // binding dell'evento direttamente qui
    L.DomEvent.on(checkbox, 'change', function(e) {
      if (e.target.checked) {
        map.addLayer(markerLayer);
      } else {
        map.removeLayer(markerLayer);
      }
    });

    return container;
  }
});
map.addControl(new CustomToggle());

// 7. (Opzionale) Sensibilità dello zoom a rotellina
// se la tua versione di Leaflet supporta questo, altrimenti commenta:
// map.scrollWheelZoom.options.zoomSensitivity = 0.2;
