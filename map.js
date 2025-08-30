// map.js
document.addEventListener('DOMContentLoaded', function() {

  // 0. Custom Home‐Control inline
  L.Control.Home = L.Control.extend({
    options: {
      position:    'topright',
      title:       'Ritorna alla vista iniziale',
      homeCoords:  [49, 30],
      homeZoom:    5
    },
    onAdd: function(map) {
      var opts = this.options;
      // 1) aggiunta della classe per il selettore CSS
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
                }, this);
      return container;
    }
  });
  L.control.home = function(opts) {
    return new L.Control.Home(opts);
  };

  // … (1. Lista capitali, 2. Vista iniziale, 3. Basemap, 4. Overlay, 5. Init mappa, 6. Boundaries) …

  // 7. Aggiungi Home‐Control custom e assegnalo a una variabile
  var homeControl = L.control.home({
    homeCoords: initial.center,
    homeZoom:   initial.zoom,
    title:      'Torna alla vista iniziale'
  });
  map.addControl(homeControl);

  // 8. Personalizza dimensioni pulsante Home
  var containerHome = homeControl.getContainer();
  var linkHome      = containerHome.querySelector('a');

  // dimensioni del box (container)
  containerHome.style.width  = '48px';
  containerHome.style.height = '48px';

  // 2) scala l’emoji direttamente via font-size
  linkHome.style.width      = '48px';
  linkHome.style.height     = '48px';
  linkHome.style.lineHeight = '48px';
  linkHome.style.padding    = '0';
  linkHome.style.fontSize   = '28px';

  // 9. Layer control
  L.control.layers(
    baseMaps,
    { 'Capitali': capitali },
    { collapsed: false, position: 'topright' }
  ).addTo(map);

  // 10. Aggiorna su resize/orientamento
  mql.addEventListener('change', function(e) {
    var p = e.matches ? params.mobile : params.desktop;
    map.setView(p.center, p.zoom);
  });

}); // chiusura del listener DOMContentLoaded
