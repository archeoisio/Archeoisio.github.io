document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [50, 10], zoom: 5 };
  const desktopView = { center: [49, 30], zoom: 5 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  // --- Layer base ---
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  });

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
    'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  });

  // --- Overlay capitale ---
  const capitali = L.layerGroup();
  const capitalsData = [
    { name: "Roma", coords: [41.9028, 12.4964] },
    { name: "Parigi", coords: [48.8566, 2.3522] },
    { name: "Londra", coords: [51.5074, -0.1278] }
  ];

  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).bindPopup(name).addTo(capitali);
    marker.on('click', () => {
      map.flyTo(coords, 14, { animate: true, duration: 1.2 });
      marker.openPopup();
    });
  });

  // --- Istanza mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [osm, capitali],
    zoomControl: true
  });

  // --- Pulsanti Home + Locate ---
  const customControls = L.control({ position: 'topright' });
  customControls.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-controls leaflet-bar');

    // Pulsante Home
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '⌂';
    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 1.5 });
    });

    // Pulsante Locate
    const locateBtn = L.DomUtil.create('a', 'custom-locate-button', container);
    locateBtn.href = '#';
    locateBtn.innerHTML = '📍';
    L.DomEvent.on(locateBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.locate({ setView: false, watch: false });
    });

    return container;
  };
  customControls.addTo(map);

  // --- SWITCHER subito sotto ---
  L.control.layers(
    { "OpenStreetMap": osm, "Satellite": satellite },
    { "Capitali": capitali },
    { collapsed: false, position: 'topright' }
  ).addTo(map);

  // --- Marker Locate ---
  map.on('locationfound', function(e) {
    // FlyTo verso posizione
    map.flyTo(e.latlng, 18, { animate: true, duration: 1.5 });

    // Emoji marker
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'custom-locate-marker',
        html: '📍',
        iconSize: [30, 30]
      })
    }).addTo(map);

    // Cerchietto blu piccolo
    L.circleMarker(e.latlng, {
      radius: 5,
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.5
    }).addTo(map);
  });
});

