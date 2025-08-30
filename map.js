document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [49, 30], zoom: 6 };
  const desktopView = { center: [50, 10], zoom: 7 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri', noWrap: true }
  );
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors', noWrap: true }
  );
  const baseLayers = { 'Satellite': satellite, 'OpenStreetMap': osm };

  const capitali = L.layerGroup();
  [
    { name: 'Roma',   coords: [41.9028, 12.4964] },
    { name: 'Parigi', coords: [48.8566,  2.3522] },
    { name: 'Londra', coords: [51.5074, -0.1278] }
  ].forEach(({ name, coords }) => {
    const m = L.marker(coords).bindPopup(name).on('click', () => {
      map.setView(coords, 10);
      m.openPopup();
    });
    capitali.addLayer(m);
  });

  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    minZoom: 3,
    maxZoom: 20,
    zoomControl: false,
    scrollWheelZoom: { wheelPxPerZoomLevel: 1000, wheelDebounceTime: 80 },
    zoomDelta: 0.1,
    layers: [satellite, capitali],
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // Zoom nativo
  L.control.zoom({ position: 'topleft' }).addTo(map);

  // Layer switcher
  L.control.layers(baseLayers, { 'Capitali': capitali }, { collapsed: true }).addTo(map);

  // Scala metrica
  let scaleControl = L.control.scale({
    position: 'bottomleft',
    maxWidth: Math.floor(window.innerWidth * 0.3),
    metric: true,
    imperial: false
  }).addTo(map);

  function updateScale() {
    map.removeControl(scaleControl);
    scaleControl = L.control.scale({
      position: 'bottomleft',
      maxWidth: Math.floor(window.innerWidth * 0.3),
      metric: true,
      imperial: false
    }).addTo(map);
  }
  map.on('zoomend', updateScale);
  window.addEventListener('resize', updateScale);

  // Home button
  if (typeof L.Control.Home === 'function') {
    new L.Control.Home({
      position: 'topright',
      lat: initialView.center[0],
      lng: initialView.center[1],
      zoom: initialView.zoom,
      className: 'home-control'
    }).addTo(map);
  } else {
    console.warn('HomeControl non trovato');
  }

  // Locate button
  if (typeof L.control.locate === 'function') {
    L.control.locate({
      position: 'topright',
      icon: '📍',
      markerStyle: { opacity: 0 },
      showPopup: false,
      keepCurrentZoomLevel: true,
      flyTo: true,
      strings: { title: 'Localizza me' },
      className: 'locate-control'
    }).addTo(map);
  } else {
    console.warn('LocateControl non trovato');
  }
});
