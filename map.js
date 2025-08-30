// 1. Base layers
const baseMaps = {
  'Esri Satellite': L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution:
        'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, ' +
        'Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  ),
  'OpenStreetMap': L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenStreetMap contributors' }
  )
};

// 2. Overlay “Capitali” con click-to-zoom
const capitali = L.layerGroup();
[
  { name: 'Roma',    coords: [41.9028, 12.4964] },
  { name: 'Parigi',  coords: [48.8566,  2.3522] },
  { name: 'Londra',  coords: [51.5074, -0.1278] }
].forEach(({ name, coords }) => {
  const m = L.marker(coords)
    .bindPopup(name)
    .on('click', () => {
      map.setView(coords, 10);
      m.openPopup();
    });
  capitali.addLayer(m);
});

// 3. Inizializza mappa
const map = L.map('map', {
  zoomControl:         false,
  scrollWheelZoom:     true,
  wheelPxPerZoomLevel: 1000,
  zoomDelta:           0.1,
  layers:              [ baseMaps['Esri Satellite'], capitali ],
  maxBounds:           [[-90, -180], [90, 180]],
  maxBoundsViscosity:  1.0
}).setView([41.9028, 12.4964], 6);

// 4. LayerSwitcher (collapsed)
L.control
  .layers(baseMaps, { 'Capitali': capitali }, { collapsed: true })
  .addTo(map);

// 5. Scala metrica
L.control.scale({
  position: 'bottomleft',
  maxWidth: Math.floor(window.innerWidth * 0.3),
  metric:   true,
  imperial: false
}).addTo(map);

// 6. Pulsante Home 🏠
L.control.home({
  position: 'topright',
  icon:     '🏠'
}).addTo(map);

// 7. LocateControl 📍 + marker custom
const locateEmoji      = '📍';
const locateMarkerIcon = L.divIcon({
  html:       locateEmoji,
  className:  'custom-locate-marker',
  iconSize:   [50, 50],
  iconAnchor: [25, 25]
});

L.control.locate({
  position:             'topright',
  icon:                 locateEmoji,
  markerStyle:          { opacity: 0 },
  showPopup:            false,
  keepCurrentZoomLevel: true,
  flyTo:                true
}).addTo(map);

let _lastLocateMarker;
map.on('locationfound', (e) => {
  if (_lastLocateMarker) map.removeLayer(_lastLocateMarker);
  _lastLocateMarker = L.marker(e.latlng, { icon: locateMarkerIcon }).addTo(map);
});
map.on('locationerror', (err) => console.warn('Locate error:', err.message));
