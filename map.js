document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [50, 10], zoom: 5 };
  const desktopView = { center: [49, 30], zoom: 5 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;
  const flyDuration = 10; // durata totale volo in secondi

  // --- Layer base ---
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    noWrap: true,
    updateWhenIdle: true,
    updateWhenZooming: false
  });

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', noWrap: true, updateWhenIdle: true, updateWhenZooming: false }
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

  // --- Funzione di volo “navicella spaziale” ---
  function smoothFly(marker, targetLatLng, targetZoom) {
    // fase 1: volo orizzontale
    map.flyTo([targetLatLng[0], targetLatLng[1]], map.getZoom(), {
      animate: true,
      duration: flyDuration * 0.5,
      easeLinearity: 0.1
    });

    // fase 2: zoom verticale alla destinazione
    map.once('moveend', () => {
      map.flyTo(targetLatLng, targetZoom, {
        animate: true,
        duration: flyDuration * 0.5,
        easeLinearity: 0.1
      });
    });

    // apri popup alla fine del volo
    map.once('moveend', () => {
      if(marker) marker.openPopup();
    });
  }

  // --- Marker capitali con flyTo e popup ---
  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).bindPopup(name).addTo(capitali);
    marker.on('click', () => {
      smoothFly(marker, coords, 14);
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
    container.style.marginTop = '10px';  // distanza dal top / switcher
    container.style.marginRight = '10px';

    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🗺️';
    homeBtn.title = "Torna alla vista iniziale";

    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault();
      smoothFly(null, initialView.center, initialView.zoom);
    });

    return container;
  };
  homeBox.addTo(map);
});
