document.addEventListener('DOMContentLoaded', () => {
  // 1. Soglia mobile vs desktop
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [49, 30], zoom: 6 };
  const desktopView = { center: [50, 10], zoom: 7 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  // 2. Layer di base
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri', noWrap: true }
  );
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors', noWrap: true }
  );
  const baseLayers = {
    'Satellite': satellite,
    'OpenStreetMap': osm
  };

  // 3. Overlay di esempio: capitali con click-zoom
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

  // 4. Istanzia la mappa
  const map = L.map('map', {
    center:           initialView.center,
    zoom:             initialView.zoom,
    minZoom:          3,
    maxZoom:          20,
    zoomControl:      false,
    scrollWheelZoom:  { wheelPxPerZoomLevel: 1000, wheelDebounceTime: 80 },
    zoomDelta:        0.1,
    layers:           [satellite, capitali],
    maxBounds:        [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // 5. Aggiungi zoom nativo in alto a sinistra
  L.control.zoom({ position: 'topleft' }).addTo(map);

  // 6. LayerSwitcher (collapsed)
  L.control.layers(baseLayers, { 'Capitali': capitali }, { collapsed: true })
    .addTo(map);

  // 7. Scala metrica (ri-creata al resize/zoom)
  let scaleControl = L.control.scale({
    position: 'bottomleft',
    maxWidth: Math.floor(window.innerWidth * 0.3),
    metric:   true,
    imperial: false
  }).addTo(map);

  function updateScale() {
    map.removeControl(scaleControl);
    scaleControl = L.control.scale({
      position: 'bottomleft',
      maxWidth: Math.floor(window.innerWidth * 0.3),
      metric:   true,
      imperial: false
    }).addTo(map);
  }
  map.on('zoomend', updateScale);
  window.addEventListener('resize', updateScale);

  // 8. Pulsante Home 🏠 (solo se il plugin è caricato)
  if (typeof L.control.home === 'function') {
    L.control.home({
      position: 'topright',
      lat:      initialView.center[0],
      lng:      initialView.center[1],
      zoom:     initialView.zoom
    }).addTo(map);
  } else {
    console.warn('HomeControl non trovato: L.control.home è undefined');
  }

  // 9. Pulsante Locate 📍 (solo se il plugin è caricato)
  if (typeof L.control.locate === 'function') {
    L.control.locate({
      position:             'topright',
      icon:                 '📍',
      markerStyle:          { opacity: 0 },
      showPopup:            false,
      keepCurrentZoomLevel: true,
      flyTo:                true
    }).addTo(map);

    // custom marker emoji
    map.on('locationfound', e => {
      L.marker(e.latlng, {
        icon: L.divIcon({
          html:       '📍',
          className:  'custom-locate-marker',
          iconSize:   [50, 50],
          iconAnchor: [25, 25]
        })
      }).addTo(map);
    });

    map.on('locationerror', () => {
      alert('Impossibile rilevare la posizione');
    });
  } else {
    console.warn('LocateControl non trovato: L.control.locate è undefined');
  }
});
