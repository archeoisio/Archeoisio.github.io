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
    maxBoundsViscosity: 1.0,
    preferCanvas: true
  });

  // --- Precaricamento tiles: buffer doppio rispetto alla vista iniziale ---
  const preloadTiles = (layer, center, zoom) => {
    const mapSize = map.getSize();
    const bounds = map.getBounds();
    const bufferLat = (bounds.getNorth() - bounds.getSouth()) * 1.5;
    const bufferLng = (bounds.getEast() - bounds.getWest()) * 1.5;
    const preBounds = L.latLngBounds(
      [center[0]-bufferLat, center[1]-bufferLng],
      [center[0]+bufferLat, center[1]+bufferLng]
    );
    layer.addTo(map);
    layer._reset && layer._reset(); // forza refresh tiles
    map.fitBounds(preBounds, { animate: false });
    map.setView(center, zoom, { animate: false });
  };

  preloadTiles(satellite, initialView.center, initialView.zoom);

  // --- FlyTo iniziale molto smooth ---
  map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 10, easeLinearity: 0.25 });

  // --- Marker capitali con flyTo smooth e popup alla fine ---
  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).addTo(capitali);

    marker.on('click', () => {
      map.flyTo(coords, 14, { animate: true, duration: 8, easeLinearity: 0.25 });
      map.once('moveend', () => {
        marker.bindPopup(name).openPopup();
      });
    });
  });

  // --- SWITCHER layer primo in alto ---
  const layersControl = L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": capitali },
    { collapsed: true }
  ).addTo(map);

  // --- Box Home sotto switcher ---
  const homeBox = L.control({ position: 'topright' });
  homeBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');
    container.style.marginTop = '10px';  // distanza dal top / switcher
    container.style.marginRight = '10px';

    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🗺️';
    homeBtn.title = "Torna alla vista iniziale";

    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 10, easeLinearity: 0.25 });
    });

    return container;
  };
  homeBox.addTo(map);
});
