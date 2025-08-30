document.addEventListener('DOMContentLoaded', () => {
  // 1. Soglia mobile vs desktop
  const MOBILE_MAX_WIDTH = 767;

  // 2. Configurazioni delle due viste
  const mobileView  = { center: [49, 30], zoom: 6 };
  const desktopView = { center: [50, 10], zoom: 7 };

  // 3. Layer di base
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri' , noWrap: true }
  );
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OSM' , noWrap: true }
  );

  const baseLayers = {
    'Satellite': satellite,
    'OpenStreetMap': osm
  };

  // 4. Overlay di esempio: capitali con click‐zoom
  const capitali = L.layerGroup();
  [
    { name: 'Roma',   coords: [41.9028, 12.4964] },
    { name: 'Parigi', coords: [48.8566,  2.3522] },
    { name: 'Londra', coords: [51.5074, -0.1278] }
  ].forEach(({ name, coords }) => {
    const m = L.marker(coords)
      .bindPopup(name)
      .on('click', () => {
        map.setView(coords, 10);
        m.openPopup();
      });
    capitali.addLayer(m);
  });

  // 5. Scegli vista iniziale
  const isMobile     = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView  = isMobile ? mobileView : desktopView;

  // 6. Istanzia la mappa
  const map = L.map('map', {
    center:        initialView.center,
    zoom:          initialView.zoom,
    minZoom:       3,
    maxZoom:       20,
    zoomControl:   false,
    scrollWheelZoom: {
      wheelPxPerZoomLevel: 1000,
      wheelDebounceTime:   80
    },
    zoomDelta:     0.1,
    layers:        [ satellite, capitali ],
    maxBounds:     [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // 7. LayerSwitcher (collapsed → icona)
  L.control.layers(baseLayers, { 'Capitali': capitali }, { collapsed: true })
    .addTo(map);

  // 8. Scala metrica
  L.control.scale({
    position: 'bottomleft',
    maxWidth: Math.floor(window.innerWidth * 0.3),
    metric:   true,
    imperial: false
  }).addTo(map);

  // 9. Pulsante Home 🏠
  L.control.home({
    position: 'topright',
    lat: initialView.center[0],
    lng: initialView.center[1],
    zoom: initialView.zoom
  }).addTo(map);

  // 10. Pulsante Locate 📍 con marker custom
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

  let _locMarker;
  map.on('locationfound', e => {
    if (_locMarker) map.removeLayer(_locMarker);
    _locMarker = L.marker(e.latlng, { icon: locateMarkerIcon })
                   .addTo(map);
  });
  map.on('locationerror', () => {
    alert('Impossibile rilevare la posizione');
  });

  // 11. Aggiorna scala al resize/zoom
  function updateScale() {
    map.removeControl(map.scaleControl);
    map.scaleControl = L.control.scale({
      position: 'bottomleft',
      maxWidth: Math.floor(window.innerWidth * 0.3),
      metric:   true,
      imperial: false
    }).addTo(map);
  }
  map.on('zoomend', updateScale);
  window.addEventListener('resize', updateScale);
});
