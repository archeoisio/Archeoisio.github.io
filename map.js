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
    { name: "Abu Dhabi", coords: [24.4539, 54.3773] },
    { name: "Abuja", coords: [9.0579, 7.4951] },
    { name: "Accra", coords: [5.6037, -0.1870] },
    { name: "Addis Abeba", coords: [9.0300, 38.7400] },
    { name: "Algeri", coords: [36.7538, 3.0588] },
    { name: "Amman", coords: [31.9454, 35.9284] },
    { name: "Amsterdam", coords: [52.3676, 4.9041] },
    { name: "Andorra la Vella", coords: [42.5078, 1.5211] },
    { name: "Ankara", coords: [39.9208, 32.8541] },
    { name: "Antananarivo", coords: [-18.8792, 47.5079] },
    // … continua con tutte le altre capitali …
    { name: "Zagabria", coords: [45.8150, 15.9819] }
  ];

  // --- Istanza mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [satellite, capitali],
    zoomControl: true,
    minZoom: 3,
    maxBounds: [[-90, -180], [90, 180]]
  });

  // --- Precaricamento tiles ---
  satellite.addTo(map);

  // --- FlyTo iniziale ---
  map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 10, easeLinearity: 1 });

  // --- Marker capitali con popup contenente icona lente ---
  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).addTo(capitali);

    const popupContent = document.createElement('div');
    popupContent.style.display = 'flex';
    popupContent.style.justifyContent = 'space-between';
    popupContent.style.alignItems = 'center';
    popupContent.style.width = '80px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.style.fontSize = '20px';

    const zoomIcon = document.createElement('span');
    zoomIcon.innerHTML = '🔍';
    zoomIcon.style.cursor = 'pointer';
    zoomIcon.style.fontSize = '24px';

    popupContent.appendChild(nameSpan);
    popupContent.appendChild(zoomIcon);

    marker.bindPopup(popupContent);

    zoomIcon.addEventListener('click', () => {
      marker.closePopup();
      map.flyTo(coords, 14, { animate: true, duration: 8, easeLinearity: 1 });
    });

    marker.on('click', () => {
      marker.openPopup();
    });
  });

  // --- Etichette capitali (visibili solo a zoom ≥16) ---
  const labels = L.layerGroup().addTo(map);
  capitalsData.forEach(({ name, coords }) => {
    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'capital-label',
        html: `<span style="color: black; font-size:14px;">${name}</span>`,
        iconSize: [100, 20],
        iconAnchor: [50, 0]
      }),
      interactive: false
    });
    labels.addLayer(label);
  });

  map.on('zoomend', () => {
    if (map.getZoom() >= 16) {
      map.addLayer(labels);   // mostra etichette a zoom 16, 17, 18
    } else {
      map.removeLayer(labels); // nasconde etichette per zoom < 16
    }
  });

  // --- SWITCHER layer ---
  L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": capitali },
    { collapsed: true }
  ).addTo(map);

  // --- Box Home + Locate sotto switcher ---
  const homeBox = L.control({ position: 'topright' });
  homeBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');
    container.style.marginTop = '10px';
    container.style.marginRight = '10px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    container.style.background = 'transparent';
    container.style.boxShadow = 'none';

    // --- Pulsante Home ---
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🗺️';
    homeBtn.title = "Torna alla vista iniziale";
    homeBtn.style.display = 'flex';
    homeBtn.style.justifyContent = 'center';
    homeBtn.style.alignItems = 'center';
    homeBtn.style.width = '45px';
    homeBtn.style.height = '45px';
    homeBtn.style.fontSize = '25px';
    homeBtn.style.background = 'white';
    homeBtn.style.borderRadius = '4px';
    homeBtn.style.cursor = 'pointer';
    homeBtn.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
    homeBtn.style.textDecoration = 'none';
    homeBtn.style.marginBottom = '5px';

    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.closePopup();
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 10, easeLinearity: 1 });
    });

    // --- Pulsante Locate ---
    const locateControl = L.control.locate({
      flyTo: { duration: 10, easeLinearity: 1 },
      strings: { title: "Mostrami la mia posizione" },
      locateOptions: { enableHighAccuracy: true, watch: false }
    });
    const locateBtn = locateControl.onAdd(map);

    locateBtn.style.width = '45px';
    locateBtn.style.height = '45px';
    locateBtn.style.fontSize = '25px';
    locateBtn.style.background = 'white';
    locateBtn.style.borderRadius = '4px';
    locateBtn.style.cursor = 'pointer';
    locateBtn.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
    locateBtn.style.textDecoration = 'none';
    locateBtn.style.marginBottom = '5px';

    container.appendChild(locateBtn);

    return container;
  };
  homeBox.addTo(map);
});
