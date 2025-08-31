// --- Container pulsanti + switcher ---
const customControls = L.control({ position: 'topright' });

customControls.onAdd = function(map) {
  const container = L.DomUtil.create('div', 'custom-controls leaflet-bar');

  // --- SWITCHER layer primo in alto ---
  const layersControl = L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": capitali },
    { collapsed: false }
  ).addTo(map);
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

  // --- Pulsante Locate (personalizzato) ---
  const locateBtn = L.DomUtil.create('a', 'custom-locate-button', container);
  locateBtn.href = '#';
  locateBtn.innerHTML = '📍';
  locateBtn.title = "Mostrami la mia posizione";
  L.DomEvent.on(locateBtn, 'click', e => {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);

    map.locate({ setView: false, watch: false, enableHighAccuracy: true });

    // evento locationfound per marker + cerchio
    map.once('locationfound', function(ev) {
      map.flyTo(ev.latlng, 18, { animate: true, duration: 15 });

      // marker emoji posizione
      L.marker(ev.latlng, {
        icon: L.divIcon({
          className: 'custom-locate-marker',
          html: '📍',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      }).addTo(map);

      // cerchio Apple-style al termine del flyTo
      map.once('moveend', () => {
        L.circle(ev.latlng, {
          radius: 30,
          color: '#007aff',
          fillColor: '#007aff',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);
      });
    });
  });

  return container;
};
customControls.addTo(map);
