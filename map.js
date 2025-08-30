// 1. Soglia per distinguere mobile vs desktop
const MOBILE_MAX_WIDTH = 767;

// 2. Configura centro e zoom per entrambe le modalità
const mobileView = {
  center: [49, 30], // Eurasia
  zoom: 6
};
const desktopView = {
  center: [50, 10], // Italia
  zoom: 7
};

// 3. Preparo il layer satellitare di default
const defaultSatellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
  }
);

// 4. BaseLayers e overlays (se ne avrai bisogno)
const baseLayers = {
  'Satellite': defaultSatellite,
  'OpenStreetMap': L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors' }
  )
};
const overlays = {
  // 'My Overlay': L.geoJSON(...)
};

// 5. Determino la vista iniziale
const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
const initialView = isMobile ? mobileView : desktopView;

// 6. Creo la mappa con restrizioni e layer di partenza
const map = L.map('map', {
  center: initialView.center,
  zoom: initialView.zoom,
  minZoom: 5,
  maxZoom: 20,
  zoomControl: false,
  layers: [defaultSatellite]
});

// 7. Fissi i confini (esempio: confina l’Italia)
const southWest = L.latLng(35, 6);
const northEast = L.latLng(48, 19);
map.setMaxBounds(L.latLngBounds(southWest, northEast));

// 8. Aggiungo layer-switcher
L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

// 10. Aggiungo il controllo Home (torna alla vista iniziale)
L.control.home({
  position: 'topright',
  zoom: initialView.zoom,
  lat: initialView.center[0],
  lng: initialView.center[1]
}).addTo(map);

// 11. Aggiungo il Locate Control
L.control.locate({
  position: 'topright',
  strings: {
    title: 'Trova la tua posizione'
  },
  flyTo: true,
  keepCurrentZoomLevel: true
}).addTo(map);

// 12. Aggiungo una barra di scala grande
L.control.scale({
  position: 'bottomleft',
  maxWidth: 200,
  metric: true,
  imperial: false
}).addTo(map);

// 13. (Opzionale) Ricalibra view al resize/orientamento
window.addEventListener('resize', () => {
  const nowMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
  if (nowMobile !== isMobile) {
    // Ripristino la vista appropriata
    const view = nowMobile ? mobileView : desktopView;
    map.setView(view.center, view.zoom);
  }
});

