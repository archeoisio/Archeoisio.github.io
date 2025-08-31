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

  // --- Marker capitali con flyTo e popup ---
  capitalsData.forEach(({ name, coords }) => {
    const marker = L.marker(coords).bindPopup(name).addTo(capitali);
    marker.on('click', () => {
      map.flyTo(coords, 14, { animate: true, duration: 10 });
      marker.openPopup();
    });
  });

  // --- Container pulsanti + switcher ---
  const customControls = L.control({ position: 'topright' });
  customControls.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-controls leaflet-bar');

    // --- SWITCHER layer primo in alto ---
    const layersControl = L.control.layers(
      { "Satellite": satellite, "OpenStreetMap": osm },
      { "Capitali": capitali },
      { collapsed: false }
    );
    layersControl.onAdd(map);  // inizializza container
    container.appendChild(layersControl.getContainer());

    // --- Pulsante Home ---
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🗺️';
    homeBtn.title = "Torna alla vista iniziale";
    L.DomEvent.on(homeBtn, 'click', e => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 8 });
    });

    // --- Pulsante Pinpoint ---
    const pinBtn = L.DomUtil.create('a', 'custom-pin-button', container);
    pinBtn.href = '#';
    pinBtn.innerHTML = '📌';
    pinBtn.title = "Aggiungi un marker";
    L.DomEvent.on(pinBtn, 'click', e => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      alert('Clicca sulla mappa per aggiungere un marker');
      map.once('click', ev => {
        L.marker(ev.latlng, {
          icon: L.divIcon({
            className: 'custom-pin-marker',
            html: '📍',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          })
        }).addTo(map).bindPopup('Marker utente').openPopup();
      });
    });

    // --- Pulsante Locate ---
    const locateBtn = L.DomUtil.create('a', 'custom-locate-button', container);
    locateBtn.href = '#';
    locateBtn.innerHTML = '📍';
    locateBtn.title = "Mostrami la mia posizione";
    L.DomEvent.on(locateBtn, 'click', e => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.locate({ setView: true, maxZoom: 18 });
    });

    return container;
  };

  customControls.addTo(map);
});
