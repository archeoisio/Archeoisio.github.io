document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [49, 30], zoom: 6 };
  const desktopView = { center: [50, 10], zoom: 7 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri', noWrap: true }
  );
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors', noWrap: true }
  );
  const baseLayers = { 'Satellite': satellite, 'OpenStreetMap': osm };

  const capitali = L.layerGroup();
  [
    { name: 'Roma', coords: [41.9028, 12.4964] },
    { name: 'Parigi', coords: [48.8566, 2.3522] },
    { name: 'Londra', coords: [51.5074, -0.1278] }
  ].forEach(({ name, coords }) => {
    const m = L.marker(coords).bindPopup(name).on('click', () => {
      map.setView(coords, 10);
      m.openPopup();
    });
    capitali.addLayer(m);
  });

  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    minZoom: 2,
    maxZoom: 20,
    zoomControl: false,
    scrollWheelZoom: { wheelPxPerZoomLevel: 1000, wheelDebounceTime: 80 },
    zoomDelta: 0.1,
    layers: [satellite, capitali],
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // Layer switcher
  L.control.layers(baseLayers, { 'Capitali': capitali }, { collapsed: true }).addTo(map);

  // Scala metrica
  let scaleControl = L.control.scale({
    position: 'bottomleft',
    maxWidth: Math.floor(window.innerWidth * 0.3),
    metric: true,
    imperial: false
  }).addTo(map);

  function updateScale() {
    map.removeControl(scaleControl);
    scaleControl = L.control.scale({
      position: 'bottomleft',
      maxWidth: Math.floor(window.innerWidth * 0.3),
      metric: true,
      imperial: false
    }).addTo(map);
  }
  map.on('zoomend', updateScale);
  window.addEventListener('resize', updateScale);

  // --- Container custom sotto switcher ---
  const topRight = map._controlCorners.topright;
  const customContainer = L.DomUtil.create('div', 'custom-controls');
  topRight.appendChild(customContainer);

  // Pulsante Home
  if (typeof L.Control.Home === 'function') {
    const home = new L.Control.Home({
      lat: initialView.center[0],
      lng: initialView.center[1],
      zoom: initialView.zoom
    });
    home.addTo(map);
    customContainer.appendChild(home.getContainer());
  }

  // Pulsante Locate con emoji e marker
  if (typeof L.control.locate === 'function') {
    const locate = L.control.locate({
      strings: { title: 'Localizza me' },
      setView: false, // gestiamo flyTo manualmente
      keepCurrentZoomLevel: false,
      drawCircle: true,
      showPopup: false
    }).addTo(map);

    // Sposto nel container custom e aggiungo classe CSS per emoji
    const locateEl = locate.getContainer();
    locateEl.classList.add('custom-locate-button');
    customContainer.appendChild(locateEl);

    map.on('locationfound', function(e) {
      // Fly e zoom 2
      map.flyTo(e.latlng, 2);

      // Marker emoji
      L.marker(e.latlng, {
        icon: L.divIcon({
          html: '📍',
          className: 'custom-locate-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(map);

      // Ridimensionamento cerchio blu metà
      if (e.accuracy) {
        locate._circle.setRadius(e.accuracy / 2);
      }
    });

    // Clic sul pulsante Locate: attiva localizzazione
    locateEl.addEventListener('click', () => {
      locate.start();
    });
  }
});
