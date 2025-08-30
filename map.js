// map.js
document.addEventListener('DOMContentLoaded', function() {

  // 1. Lista capitali
  var cities = [
    { name: "Abu Dhabi",     lat: 24.4539, lon: 54.3773 },
    { name: "Abuja",         lat: 9.0579,  lon: 7.49508 },
    { name: "Addis Abeba",   lat: 9.145,   lon: 40.4897 },
    /* … tutte le altre … */
    { name: "Zanzibar City", lat: -6.1659, lon: 39.2026 }
  ];

  // 2. Vista iniziale desktop vs mobile
  var params = {
    desktop: { center: [49, 30], zoom: 5 },
    mobile:  { center: [50, 10], zoom: 5 }
  };
  var mql     = window.matchMedia('(max-width:767px)');
  var initial = mql.matches ? params.mobile : params.desktop;

  // 3. Definizione delle basemap
  var baseMaps = {
    'OSM Standard': L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap', noWrap: true }
    ),
    'CartoDB Positron': L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; CartoDB', subdomains: 'abcd', noWrap: true }
    ),
    'Esri Satellite': L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '&copy; Esri', noWrap: true }
    )
  };

  // 4. Overlay Capitali
  var capitali = L.layerGroup();
  cities.forEach(function(c) {
    L.marker([c.lat, c.lon])
      .bindPopup('<b>' + c.name + '</b>')
      .on('click', function() {
        map.setView([c.lat, c.lon], 14);
      })
      .addTo(capitali);
  });

  // 5. Inizializzazione mappa (zoomControl:false -> niente bottoni zoom)
  var map = L.map('map', {
    center:         initial.center,
    zoom:           initial.zoom,
    minZoom:        3,
    worldCopyJump:  true,
    layers:         [ baseMaps['OSM Standard'], capitali ],
    zoomControl:    false,
    scrollWheelZoom: {
      wheelPxPerZoomLevel: 1000,  // più alto = scroll‐zoom più lento
      wheelDebounceTime:   80
    },
    zoomDelta:      0.1         // passi di zoom molto piccoli
  });

  // 6. Home‐Control custom
  L.Control.Home = L.Control.extend({
    options: {
      position:   'topright',
      title:      'Torna alla vista iniziale',
      homeCoords: initial.center,
      homeZoom:   initial.zoom
    },
    onAdd: function(map) {
      var opts      = this.options;
      var container = L.DomUtil.create(
        'div',
        'leaflet-bar leaflet-control leaflet-control-home'
      );
      var btn = L.DomUtil.create('a', '', container);
      btn.href      = '#';
      btn.title     = opts.title;
      btn.innerHTML = '🏠';

      L.DomEvent.on(btn, 'click', L.DomEvent.stop)
                .on(btn, 'click', function() {
                  map.setView(opts.homeCoords, opts.homeZoom);
                });

      return container;
    }
  });
  L.control.home = function(opts) {
    return new L.Control.Home(opts);
  };
  L.control.home().addTo(map);

  // 7. Layer‐switcher (basemaps + capitali)
  L.control.layers(
    baseMaps,
    { 'Capitali': capitali },
    { collapsed: false, position: 'topright' }
  ).addTo(map);

  // 8. Scala metrica in basso a sinistra
  L.control.scale({
    position: 'bottomleft',
    metric:   true,
    imperial: false
  }).addTo(map);

  // 9. Pulsante di localizzazione
  L.Control.Locate = L.Control.extend({
    options: { position: 'topright', title: 'Mostra la mia posizione' },
    onAdd: function(map) {
      var container = L.DomUtil.create(
        'div',
        'leaflet-bar leaflet-control leaflet-control-locate'
      );
      var btn = L.DomUtil.create('a', '', container);
      btn.href      = '#';
      btn.title     = this.options.title;
      btn.innerHTML = '📍';

      L.DomEvent.on(btn, 'click', L.DomEvent.stop)
                .on(btn, 'click', function() {
                  map.locate({ setView: true, maxZoom: 14 });
                });

      return container;
    }
  });
  L.control.locate = function(opts) {
    return new L.Control.Locate(opts);
  };
  L.control.locate().addTo(map);

  // Gestione evento successo/fallimento localizzazione
  map.on('locationfound', function(e) {
    var radius = e.accuracy / 2;
    L.marker(e.latlng)
     .addTo(map)
     .bindPopup("Sei entro " + Math.round(radius) + " metri")
     .openPopup();
    L.circle(e.latlng, { radius: radius }).addTo(map);
  });
  map.on('locationerror', function() {
    alert("Impossibile rilevare la posizione");
  });

  // 10. Risposta al resize/orientamento
  mql.addEventListener('change', function(e) {
    var p = e.matches ? params.mobile : params.desktop;
    map.setView(p.center, p.zoom);
  });

});
