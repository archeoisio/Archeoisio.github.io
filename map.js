document.addEventListener('DOMContentLoaded', () => {
  const initialView = { center: [50, 10], zoom: 5 };

  // --- Layer base ---
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true
  });

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', noWrap: true }
  );

  // --- Istanza mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [osm],
    zoomControl: true,
    minZoom: 3,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // --- Switcher layer ---
  const layersControl = L.control.layers(
    { "OpenStreetMap": osm, "Satellite": satellite },
    null, // nessun overlay
    { collapsed: false, position: 'topright' }
  ).addTo(map);
});
