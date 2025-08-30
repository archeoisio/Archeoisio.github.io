// 1. Definisco base layers
const baseMaps = {
  'Esri Satellite': L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, ' +
        'AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  ),
  'OpenStreetMap': L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors'
    }
  )
};

// 2. Un layer di esempio "capitali"
const capitali = L.layerGroup([
  L.marker([41.9028, 12.4964]).bindPopup('Roma'),
  L.marker([48.8566, 2.3522]).bindPopup('Parigi'),
  L.marker([51.5074, -0.1278]).bindPopup('Londra')
]);

// 3. Creo la mappa senza zoomControl e con zoom super-lento
const map = L.map('map', {
  zoomControl: false,
  scrollWheelZoom: {
    wheelPxPerZoomLevel: 1000,
    zoomDelta: 0.1
  },
  layers: [ baseMaps['Esri Satellite'], capitali ]
})
.setView([41.9028, 12.4964], 6);

// 4. Aggiungo LayerSwitcher
L.control.layers(baseMaps, { Capitali: capitali }).addTo(map);

// 5. Aggiungo la scala in basso a sinistra
L.control.scale({ position: 'bottomleft' }).addTo(map);

// 6. Pulsante Home con emoji 🏠
L.control.home({
  position: 'topright',
  icon: '🏠'
}).addTo(map);

// 7. Preparo DivIcon per il marker di geolocalizzazione
const locateEmoji      = '📍';
const locateMarkerIcon = L.divIcon({
  html:       locateEmoji,
  className:  'custom-locate-marker',
  iconSize:   [60, 60],
  iconAnchor: [30, 30]
});

// 8. Pulsante Locate, nascondo il pinpoint blu
L.control.locate({
  position:             'topright',
  icon:                 locateEmoji,
  markerStyle:          { opacity: 0 },
  showPopup:            false,
  keepCurrentZoomLevel: true,
  flyTo:                true
}).addTo(map);

// 9. Alla localizzazione creo il marker custom
let _lastLocateMarker;

map.on('locationfound', (e) => {
  if (_lastLocateMarker) {
    map.removeLayer(_lastLocateMarker);
  }
  _lastLocateMarker = L.marker(e.latlng, {
    icon: locateMarkerIcon
  }).addTo(map);
});

// 10. Gestisco eventuali errori di localizzazione
map.on('locationerror', (err) => {
  console.warn('Errore geolocalizzazione:', err.message);
});
