document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [50, 10], zoom: 5 };
  const desktopView = { center: [49, 30], zoom: 5 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  // --- Layer base ---
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true
  });

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', noWrap: true }
  );

  // --- Overlay capitali ---
  const capitali = L.layerGroup();
  const capitalsData = [
    { name: "Roma", coords: [41.9028, 12.4964] },
    { name: "Parigi", coords: [48.8566, 2.3522] },
    { name: "Londra", coords: [51.5074, -0.1278] }
  ];

  // --- Istanza mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [satellite, capitali],
    zoomControl: true,
    minZoom: 3,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // --- Funzione fly fluido tipo navicella ---
  function smoothFly(targetLatLng, targetZoom, marker = null) {
    const current = map.getCenter();
    const totalDuration = 15; // secondi
    const verticalDuration = totalDuration * 2/3;
    const horizontalDuration = totalDuration - verticalDuration;

    // Fase 1: movimento orizzontale lento (lat costante)
    const intermediateLatLng = [current.lat, targetLatLng.lng];
    map.flyTo(intermediateLatLng, map.getZoom(), { animate: true, duration: horizontalDuration });

    map.once('moveend', () => {
      // Fase 2: discesa verticale + zoom lento
      map.flyTo(targetLatLng, targetZoom, { animate: true, duration: verticalDuration });

      map.once('moveend', () => {
        // Apri popup se marker esiste
        if (marker) marker.openPopup();
      });
    });
  }

  // --- Marker capitali con flyTo navicella + popup alla fine ---
  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).bindPopup(name).addTo(capitali);
    marker.on('click', () => {
      smoothFly(coords, 14, marker);
    });
  });

  // --- SWITCHER layer ---
  const layersControl = L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": capitali },
    { collapsed: true }
  ).addTo(map);

  // --- Box Home sotto switcher ---
  const homeBox = L.control({ position: 'topright' });
  homeBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');
    container.style.marginTop = '10px';  
    container.style.marginRight = '10px';

    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🗺️';
    homeBtn.title = "Torna alla vista iniziale";

    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault();
      smoothFly(initialView.center, initialView.zoom, null);
    });

    return container;
  };
  homeBox.addTo(map);
});
