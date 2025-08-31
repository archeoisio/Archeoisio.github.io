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

  // --- Overlay esempio ---
  const capitali = L.layerGroup();
  L.marker([41.9028, 12.4964]).bindPopup("Roma").addTo(capitali);
  L.marker([48.8566, 2.3522]).bindPopup("Parigi").addTo(capitali);
  L.marker([51.5074, -0.1278]).bindPopup("Londra").addTo(capitali);

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
    homeBtn.innerHTML = '⌂';
    homeBtn.href = '#';
    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.setView(initialView.center, initialView.zoom);
    });

    // Pulsante Locate
    const locateBtn = L.DomUtil.create('a', 'custom-locate-button', container);
    locateBtn.href = '#';
    L.DomEvent.on(locateBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.locate({ setView: true, maxZoom: 18 });
    });

    return container;
  };
  customControls.addTo(map);

  // --- SWITCHER subito sotto ---
  L.control.layers(
    { "OpenStreetMap": osm, "Satellite": satellite },
    { "Capitali": capitali },
    { collapsed: true, position: 'topright' }
  ).addTo(map);

  // --- Marker Locate ---
  map.on('locationfound', function(e) {
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'custom-locate-marker',
        html: '📍',
        iconSize: [30, 30]
      })
    }).addTo(map);

    L.circleMarker(e.latlng, {
      radius: 5,
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.5
    }).addTo(map);
  });
});
