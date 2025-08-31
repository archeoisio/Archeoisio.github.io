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

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    noWrap: true
  });

  // --- Overlay capitali ---
  const capitali = L.layerGroup();
  const capitalsData = [
    { name: "Roma", coords: [41.9028, 12.4964] },
    { name: "Parigi", coords: [48.8566, 2.3522] },
    { name: "Londra", coords: [51.5074, -0.1278] }
  ];

  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).bindPopup(name).addTo(capitali);
    marker.on('click', () => {
      map.flyTo(coords, 10, { animate: true, duration: 10 });
      marker.openPopup();
    });
  });

  // --- Istanza mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [osm, capitali],
    zoomControl: true,
    minZoom: 2,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // --- Pulsante Home ---
  const customControls = L.control({ position: 'topright' });
  customControls.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-controls leaflet-bar');

    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🗺️';
    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 8 });
    });

    return container;
  };
  customControls.addTo(map);

  // --- SWITCHER subito sotto pulsante Home ---
  L.control.layers(
    { "OpenStreetMap": osm, "Satellite": satellite },
    { "Capitali": capitali },
    { collapsed: true, position: 'topright' }
  ).addTo(map);

  // --- LocateControl plugin ---
  const locateControl = L.control.locate({
    position: 'topright',
    flyTo: { duration: 10 },
    strings: { title: "Mostrami la mia posizione" },
    locateOptions: { enableHighAccuracy: true, watch: false }
  }).addTo(map);

  // Rimuovo cerchio default e uso marker + cerchio Apple-style personalizzato
  locateControl.on('locationfound', function(e) {
    // Marker emoji
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'custom-locate-marker',
        html: '📍',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(map);

    // Cerchio stile Apple alla fine del flyTo
    map.once('moveend', () => {
      L.circle(e.latlng, {
        radius: 30,
        color: '#007aff',
        fillColor: '#007aff',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map);
    });
  });
});
