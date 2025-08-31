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

  // --- Pulsante Locate standard (pallino blu automatico) ---
  const locateControl = L.control.locate({
    position: 'topright',
    flyTo: { duration: 15 },
    strings: { title: "Mostrami la mia posizione" },
    locateOptions: { enableHighAccuracy: true, watch: true }
  }).addTo(map);
  // Aggiungiamo il pulsante Locate al container custom
  container.appendChild(locateControl.getContainer());

  return container;
};

customControls.addTo(map);
