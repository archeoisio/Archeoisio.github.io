document.addEventListener('DOMContentLoaded', function() {
  // 1. Base layers con noWrap per bloccare la vista al globo
  const baseMaps = {
    'Esri Satellite': L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, ' +
          'Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        noWrap: true
      }
    ),
    'OpenStreetMap': L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap contributors',
        noWrap: true
      }
    )
  };

  // 2. Overlay "Capitali" con click-to-zoom
  const capitali = L.layerGroup();
  [
    { name: 'Roma',   coords: [41.9028, 12.4964] },
    { name: 'Parigi', coords: [48.8566,  2.3522] },
    { name: 'Londra', coords: [51.5074, -0.1278] }
  ].forEach(({ name, coords }) => {
    const marker = L.marker(coords)
      .bindPopup(name)
      .on('click', () => {
        map.setView(coords, 10);
        marker.openPopup();
      });
    capitali.addLayer(marker);
  });

  // 3. Inizializza mappa con zoomControl disabilitato e scroll-wheel super lento
  const map = L.map('map', {
    center:       [41.9028, 12.4964],
    zoom:         6,
    layers:       [ baseMaps['Esri Satellite'], capitali ],
    maxBounds:    [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0,
    zoomControl:  false,
    scrollWheelZoom: {
      wheelPxPerZoomLevel: 1000,
      wheelDebounceTime:   80
    },
    zoomDelta:    0.1
  });

  // 4. LayerSwitcher (collapsed)
  L.control
    .layers(baseMaps, { 'Capitali': capitali }, { collapsed: true })
    .addTo(map);

  // 5. Scala metrica (viene disegnata con CSS ingrandito)
  L.control
    .scale({
      position: 'bottomleft',
      maxWidth: Math.floor(window.innerWidth * 0.3),
      metric:   true,
      imperial: false
    })
    .addTo(map);

  // 6. Pulsante Home custom 🏠
  L.Control.Home = L.Control.extend({
    options: {
      position:   'topright',
      title:      'Torna alla vista iniziale',
      homeCoords: [41.9028, 12.4964],
      homeZoom:   6
    },
    onAdd: function(map) {
      const opts      = this.options;
      const container = L.DomUtil.create(
        'div',
        'leaflet-bar leaflet-control leaflet-control-home'
      );
      const btn = L.DomUtil.create('a', '', container);
      btn.href      = '#';
      btn.title     = opts.title;
      btn.innerHTML = '🏠';

      L.DomEvent.on(btn, 'click', L.DomEvent.stop)
                .on(btn, 'click', () => {
                  map.setView(opts.homeCoords, opts.homeZoom);
                });

      return container;
    }
  });
  L.control.home = function(opts) {
    return new L.Control.Home(opts);
  };
  L.control.home().addTo(map);

  // 7. LocateControl 📍 con marker custom
  const locateEmoji      = '📍';
  const locateMarkerIcon = L.divIcon({
    html:       locateEmoji,
    className:  'custom-locate-marker',
    iconSize:   [50, 50],
    iconAnchor: [25, 25]
  });

  L.control
    .locate({
      position:             'topright',
      icon:                 locateEmoji,
      markerStyle:          { opacity: 0 },
      showPopup:            false,
      keepCurrentZoomLevel: true,
      flyTo:                true
    })
    .addTo(map);

  let lastLocateMarker;
  map.on('locationfound', e => {
    if (lastLocateMarker) map.removeLayer(lastLocateMarker);
    lastLocateMarker = L.marker(e.latlng, { icon: locateMarkerIcon })
                       .addTo(map);
  });
  map.on('locationerror', () => {
    alert('Impossibile rilevare la posizione');
  });
});
