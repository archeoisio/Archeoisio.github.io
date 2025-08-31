document.addEventListener('DOMContentLoaded', () => {
  const initialView = { center: [49, 10], zoom: 5 };

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

  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).bindPopup(name).addTo(capitali);
    marker.on('click', () => {
      map.flyTo(coords, 14, { animate: true, duration: 10 });
      marker.openPopup();
    });
  });

  // --- Istanza mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [osm, capitali],
    zoomControl: true,
    minZoom: 3,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // --- Switcher layer ---
  L.control.layers(
    { "OpenStreetMap": osm, "Satellite": satellite },
    { "Capitali": capitali },
    { collapsed: true, position: 'topright' }
  ).addTo(map);
});
