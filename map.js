// 1. Base layers
const baseMaps = {
  'Esri Satellite': L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/' +
    'tile/{z}/{y}/{x}',
    {
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

// 2. LayerGroup “capitali”
const capitali = L.layerGroup([
  L.marker([41.9028, 12.4964]).bindPopup('Roma'),
  L.marker([48.8566, 2.3522]).bindPopup('Parigi'),
  L.marker([51.5074, -0.1278]).bindPopup('Londra')
]);

// 3. Mappa con bounds fissi e zoom super-lento
const map = L.map('map', {
  zoomControl: false,
  scrollWheelZoom: {
    wheelPxPerZoomLevel: 1000,
    zoomDelta: 0.1
  },
  layers: [ baseMaps['Esri Satellite'], capitali ],
  maxBounds: [[-90, -180], [90, 180]],
  maxBoundsViscosity: 1.0
})
.setView([41.9028, 12.4964], 6);

// 4. LayerSwitcher
L.control.layers(baseMaps, { Capitali: capitali }).addTo(map);

// 5. Funzione per rigenerare la scala
let scaleControl;
function updateScale() {
  const maxWidth = Math.floor(window.innerWidth * 0.25);
  if (scaleControl) map.removeControl(scaleControl);
  scaleControl = L.control.scale({
    position: 'bottomleft',
    maxWidth: maxWidth,
    metric: true,
    imperial: false
  }).addTo(map);
}

// creo la scala al load
updateScale();

// 6. Ricalcolo scala ad ogni zoom o resize
map.on('zoomend', updateScale);
window.addEventListener('resize', updateScale);

// 7. Home 🏠
L.control.home({
  position: 'topright',
  icon: '🏠'
}).addTo(map);

// 8. DivIcon per locate 📍
const locateEmoji      = '📍';
const locateMarkerIcon = L.divIcon({
  html:       locateEmoji,
  className:  'custom-locate-marker',
  iconSize:   [60, 60],
  iconAnchor: [30, 30]
});

// 9. LocateControl (niente pinpoint blu)
L.control.locate({
  position:             'topright',
  icon:                 locateEmoji,
  markerStyle:          { opacity: 0 },
  showPopup:            false,
  keepCurrentZoomLevel: true,
  flyTo:                true
}).addTo(map);

// 10. Marker custom on locate
let _lastLocateMarker;
map.on('locationfound', (e) => {
  if (_lastLocateMarker) map.removeLayer(_lastLocateMarker);
  _lastLocateMarker = L.marker(e.latlng, { icon: locateMarkerIcon })
                       .addTo(map);
});

// 11. Gestione errori locate
map.on('locationerror', (err) => {
  console.warn('Errore geolocalizzazione:', err.message);
});
