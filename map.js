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
  const labels   = L.layerGroup();

  const capitalsData = [
    { name: "Abu Dhabi", coords: [24.4539, 54.3773] },
    { name: "Abuja", coords: [9.0579, 7.4951] },
    { name: "Accra", coords: [5.6037, -0.1870] }
  ];

  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [satellite, capitali],
    zoomControl: true,
    minZoom: 3,
    maxBounds: [
      [-90, -180],
      [90, 180]
    ],
    maxBoundsViscosity: 1.0
  });

  // --- Precaricamento tiles ---
  satellite.addTo(map);

  // --- FlyTo iniziale (veloce) ---
  map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 0.25, easeLinearity: 1 });

  // --- Marker capitali con popup e lente ---
  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).addTo(capitali);

    const popupContent = document.createElement('div');
    popupContent.style.display = 'flex';
    popupContent.style.justifyContent = 'space-between';
    popupContent.style.alignItems = 'center';
    popupContent.style.width = '120px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;

    const zoomIcon = document.createElement('span');
    zoomIcon.innerHTML = '🔍';
    zoomIcon.style.cursor = 'pointer';
    zoomIcon.style.fontSize = '18px';

    popupContent.appendChild(nameSpan);
    popupContent.appendChild(zoomIcon);

    marker.bindPopup(popupContent);

    zoomIcon.addEventListener('click', () => {
      marker.closePopup();
      map.flyTo(coords, 14, { animate: true, duration: 0.25, easeLinearity: 1 });
    });

    marker.on('click', () => {
      marker.openPopup();
    });

    // Etichetta testuale (visibile solo a zoom >= 16)
    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'text-label',
        html: `<span style="font-size:14px; color:white; text-shadow:1px 1px 2px black;">${name}</span>`
      })
    });
    labels.addLayer(label);
  });

  // --- Mostra/nascondi etichette in base allo zoom ---
  map.on('zoomend', () => {
    if (map.getZoom() >= 16) {
      map.addLayer(labels);
    } else {
      map.removeLayer(labels);
    }
  });

  // --- SWITCHER layer ---
  const layersControl = L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": capitali },
    { collapsed: true }
  ).addTo(map);

  // --- Box Home + Locate ---
  const controlBox = L.control({ position: 'topright' });
  controlBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');
    container.style.marginTop = '10px';
    container.style.marginRight = '0';
    container.style.border = 'none';
    container.style.background = 'transparent';
    container.style.padding = '0';

    // Pulsante Home
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🏠';
    homeBtn.title = "Torna alla vista iniziale";
    homeBtn.style.fontSize = '30px';
    homeBtn.style.width = '45px';
    homeBtn.style.height = '45px';
    homeBtn.style.lineHeight = '50px';
    homeBtn.style.textAlign = 'center';
    homeBtn.style.display = 'block';
    homeBtn.style.background = 'white';
    homeBtn.style.borderRadius = '4px';
    homeBtn.style.marginBottom = '0';

    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.closePopup();
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 0.25, easeLinearity: 1 });
    });

    // Pulsante Locate
    const locateControl = L.control.locate({
      flyTo: { duration: 0.25, easeLinearity: 1 },
      strings: { title: "Mostrami la mia posizione" },
      locateOptions: { enableHighAccuracy: true, watch: false }
    });
    const locateBtn = locateControl.onAdd(map);

    locateBtn.style.width = '45px';
    locateBtn.style.height = '45px';
    locateBtn.style.background = 'white';
    locateBtn.style.border = 'none';
    locateBtn.style.borderRadius = '8px';

    container.appendChild(locateBtn);

    return container;
  };
  controlBox.addTo(map);
});
