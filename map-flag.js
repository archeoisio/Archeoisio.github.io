document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [50, 22], zoom: 4 };
  const desktopView = { center: [45, 40], zoom: 4 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  const southWest = L.latLng(-90, 190);
  const northEast = L.latLng(90, -190);
  const maxBounds = L.latLngBounds(southWest, northEast);

  // --- Layers ---
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { noWrap: false });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { noWrap: false });

  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [satellite],
    zoomControl: true,
    minZoom: 3,
    maxZoom: 18,
    worldCopyJump: true,
    maxBounds: maxBounds,
    maxBoundsViscosity: 1,
    wheelPxPerZoomLevel: 120,
    zoomSnap: 0.1
  });

  let control = null;
  let searchMarkers = [];

  // --- Layer switcher ---
  const labels = L.layerGroup();
  L.control.layers({ "Satellite": satellite, "OSM": osm }, { "Capitali": labels }, { collapsed: true }).addTo(map);

  // --- Funzione set viewport height ---
  function setVh() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--vh', vh + 'px');
    map.invalidateSize();
  }
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', setVh);

  // --- Marker capitals (simplificato) ---
  const capitalsData = [
    { name: "Rome", nation: "Italy", coords: [41.9028, 12.4964], flag: "🇮🇹" },
    { name: "Paris", nation: "France", coords: [48.8566, 2.3522], flag: "🇫🇷" },
    { name: "Berlin", nation: "Germany", coords: [52.5200, 13.4050], flag: "🇩🇪" },
    // aggiungi gli altri...
  ];

  let lastMarker = null;

  capitalsData.forEach(({ name, nation, coords, flag }) => {
    const markerIcon = L.divIcon({
      className: 'flag-icon',
      html: `<div class="flag-box">${flag}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker(coords, { icon: markerIcon });
    marker.bindPopup(`<b>${name}</b> (${nation}) <button class="fly-btn">🔍</button>`);
    marker.on('popupopen', () => {
      marker.getPopup().getElement().querySelector('.fly-btn')
        .onclick = () => map.flyTo(coords, 14, { animate: true, duration: 3 });
    });
    labels.addLayer(marker);
  });
  labels.addTo(map);

  // --- Custom control topright ---
  const controlBox = L.control({ position: 'topright' });
  controlBox.onAdd = function() {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');

    // Pulsante Home
    const homeBtn = L.DomUtil.create('a', 'custom-btn', container);
    homeBtn.href = '#'; homeBtn.innerHTML = '🏠'; homeBtn.title = 'Torna alla vista iniziale';
    L.DomEvent.on(homeBtn, 'click', e => {
      L.DomEvent.stopPropagation(e); L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 3 });
    });

    // Pulsante Locate
    const locateControl = L.control.locate({ flyTo: { duration: 2 }, strings: { title: "Mostrami la mia posizione" } });
    container.appendChild(locateControl.onAdd(map));

    // Pulsante Route
    const routeBtn = L.DomUtil.create('a', 'custom-btn', container);
    routeBtn.href = '#'; routeBtn.innerHTML = '🗺️'; routeBtn.title = 'Mostra/Nascondi indicazioni';
    const routeBox = document.getElementById('route-box');
    if (routeBox) routeBox.style.display = 'none';

    L.DomEvent.on(routeBtn, 'click', e => {
      L.DomEvent.stopPropagation(e); L.DomEvent.preventDefault(e);
      if (!routeBox) return;
      routeBox.style.display = (routeBox.style.display === 'none') ? 'flex' : 'none';
    });

    return container;
  };
  controlBox.addTo(map);

  // --- Funzione aggiungi marker partenza/arrivo/waypoint ---
  function addRoutingMarker(latlng, label, color) {
    const marker = L.marker(latlng, {
      draggable: label !== 'Partenza' && label !== 'Arrivo',
      icon: L.divIcon({
        className: 'routing-marker',
        html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map);

    marker.bindPopup(`<b>${label}</b> <button class="fly-btn">🔍</button>`);
    marker.on('popupopen', () => {
      const btn = marker.getPopup().getElement().querySelector('.fly-btn');
      if (btn) btn.onclick = () => map.flyTo(latlng, 14, { animate: true, duration: 3 });
    });
    searchMarkers.push(marker);
    return marker;
  }

  // --- Calcola percorso ---
  document.getElementById('route-btn').addEventListener('click', async function() {
    const start = document.getElementById('start').value.trim();
    const end   = document.getElementById('end').value.trim();
    if (!start || !end) { alert("Inserisci partenza e destinazione!"); return; }

    async function geocode(query) {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!data.length) throw new Error(`Località non trovata: ${query}`);
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }

    try {
      const startCoords = await geocode(start);
      const endCoords = await geocode(end);

      // Rimuovi vecchi marker e routing
      searchMarkers.forEach(m => map.removeLayer(m));
      searchMarkers = [];
      if (control) { map.removeControl(control); control = null; }

      control = L.Routing.control({
        waypoints: [L.latLng(startCoords), L.latLng(endCoords)],
        routeWhileDragging: true,
        addWaypoints: true,
        draggableWaypoints: true,
        showAlternatives: false,
        lineOptions: { styles: [{ color: 'blue', weight: 5, opacity: 0.7 }] },
        createMarker: function(i, wp, nWps) {
          let color = i === 0 ? 'red' : i === nWps-1 ? 'green' : 'blue';
          let label = i === 0 ? 'Partenza' : i === nWps-1 ? 'Arrivo' : `Waypoint ${i}`;
          return addRoutingMarker(wp.latLng, label, color);
        }
      }).addTo(map);

      map.fitBounds([startCoords, endCoords], { padding: [50,50] });

      // --- Mostra pannello con max 5 indicazioni ---
      if (!routeBox) return;
      routeBox.classList.remove('minimized');
      routeBox.innerHTML = `
        <div class="route-header">
          Indicazioni
          <button id="minimize-btn" style="background:none;border:none;color:white;font-size:16px;cursor:pointer;">—</button>
        </div>
        <div id="route-instructions" style="overflow-y:auto; max-height:200px;"></div>
      `;
      routeBox.style.display = 'flex';
      const instructionsContainer = document.getElementById('route-instructions');

      control.on('routesfound', function(e) {
        instructionsContainer.innerHTML = '';
        const steps = e.routes[0].instructions.slice(0,5);
        steps.forEach((step, idx) => {
          const div = document.createElement('div');
          div.className = 'route-instruction';
          div.textContent = `${idx+1}. ${step.text}`;
          instructionsContainer.appendChild(div);
        });
      });

      // Pulsante minimizza/espandi
      document.getElementById('minimize-btn').addEventListener('click', () => {
        if (routeBox.classList.contains('minimized')) {
          routeBox.classList.remove('minimized');
          document.getElementById('minimize-btn').textContent = '—';
        } else {
          routeBox.classList.add('minimized');
          document.getElementById('minimize-btn').textContent = '+';
        }
      });

    } catch(err) { alert("Errore percorso: " + err.message); }
  });

  // --- Pulsante reset ---
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (control) { map.removeControl(control); control = null; }
    searchMarkers.forEach(m => map.removeLayer(m));
    searchMarkers = [];
    document.getElementById('start').value = '';
    document.getElementById('end').value = '';
  });
});
