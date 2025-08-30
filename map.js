// map.js
document.addEventListener('DOMContentLoaded', function() {
  // 1. Lista delle capitali
  var cities = [
    { name: "Abu Dhabi",        lat: 24.4539,  lon: 54.3773 },
    { name: "Abuja",            lat: 9.0579,   lon: 7.49508 },
    { name: "Addis Abeba",      lat: 9.145,    lon: 40.4897 },
    { name: "Algiers",          lat: 36.737232,lon: 3.086472 },
    { name: "Amman",            lat: 31.9454,  lon: 35.9284 },
    { name: "Ankara",           lat: 39.9334,  lon: 32.8597 },
    { name: "Asunción",         lat: -25.2637, lon: -57.5759 },
    { name: "Athens",           lat: 37.9838,  lon: 23.7275 },
    { name: "Baghdad",          lat: 33.3152,  lon: 44.3661 },
    { name: "Baku",             lat: 40.4093,  lon: 49.8671 },
    { name: "Bangkok",          lat: 13.7563,  lon: 100.5018 },
    { name: "Banjul",           lat: 13.4549,  lon: -16.5790 },
    { name: "Beijing",          lat: 39.9042,  lon: 116.4074 },
    { name: "Belgrade",         lat: 44.8176,  lon: 20.4633 },
    { name: "Berlin",           lat: 52.5200,  lon: 13.4050 },
    { name: "Bern",             lat: 46.9481,  lon: 7.4474 },
    { name: "Bogotá",           lat: 4.7110,   lon: -74.0721 },
    { name: "Brasília",         lat: -15.7801, lon: -47.9292 },
    { name: "Bratislava",       lat: 48.1482,  lon: 17.1067 },
    { name: "Brussels",         lat: 50.8503,  lon: 4.3517 },
    { name: "Bucharest",        lat: 44.4268,  lon: 26.1025 },
    { name: "Budapest",         lat: 47.4979,  lon: 19.0402 },
    { name: "Buenos Aires",     lat: -34.6037, lon: -58.3816 },
    { name: "Cairo",            lat: 30.0444,  lon: 31.2357 },
    { name: "Copenhagen",       lat: 55.6761,  lon: 12.5683 },
    { name: "Dhaka",            lat: 23.8103,  lon: 90.4125 },
    { name: "Dili",             lat: -8.5569,  lon: 125.5641 },
    { name: "Djibouti",         lat: 11.8251,  lon: 42.5903 },
    { name: "Dodoma",           lat: -6.1659,  lon: 39.2026 },
    { name: "Dublin",           lat: 53.3498,  lon: -6.2603 },
    { name: "Helsinki",         lat: 60.1699,  lon: 24.9384 },
    { name: "Islamabad",        lat: 33.6844,  lon: 73.0479 },
    { name: "Jakarta",          lat: -6.2088,  lon: 106.8456 },
    { name: "Jerusalem",        lat: 31.7683,  lon: 35.2137 },
    { name: "Kampala",          lat: 0.3136,   lon: 32.5811 },
    { name: "Kigali",           lat: -1.9706,  lon: 30.1044 },
    { name: "Kinshasa",         lat: -4.4419,  lon: 15.2663 },
    { name: "Kuala Lumpur",     lat: 3.1390,   lon: 101.6869 },
    { name: "Kuwait City",      lat: 29.3759,  lon: 47.9774 },
    { name: "Lima",             lat: -12.0464, lon: -77.0428 },
    { name: "Lisbon",           lat: 38.7169,  lon: -9.1395 },
    { name: "London",           lat: 51.5074,  lon: -0.1278 },
    { name: "Luanda",           lat: -8.8390,  lon: 13.2894 },
    { name: "Madrid",           lat: 40.4168,  lon: -3.7038 },
    { name: "Malabo",           lat: 3.7500,   lon: 8.7382 },
    { name: "Managua",          lat: 12.1364,  lon: -86.2514 },
    { name: "Mexico City",      lat: 19.4326,  lon: -99.1332 },
    { name: "Minsk",            lat: 53.9000,  lon: 27.5667 },
    { name: "Moscow",           lat: 55.7558,  lon: 37.6176 },
    { name: "Muscat",           lat: 23.5859,  lon: 58.4059 },
    { name: "Nairobi",          lat: -1.2867,  lon: 36.8172 },
    { name: "Naypyidaw",        lat: 19.7633,  lon: 96.0785 },
    { name: "New Delhi",        lat: 28.6139,  lon: 77.2090 },
    { name: "Niamey",           lat: 13.5123,  lon: 2.1128 },
    { name: "Oslo",             lat: 59.9139,  lon: 10.7522 },
    { name: "Ottawa",           lat: 45.4215,  lon: -75.6972 },
    { name: "Paris",            lat: 48.8566,  lon: 2.3522 },
    { name: "Phnom Penh",       lat: 11.5564,  lon: 104.9282 },
    { name: "Podgorica",        lat: 42.4411,  lon: 19.2636 },
    { name: "Port Moresby",     lat: -9.4438,  lon: 147.1803 },
    { name: "Pristina",         lat: 42.6629,  lon: 21.1655 },
    { name: "Quito",            lat: -0.1807,  lon: -78.4678 },
    { name: "Rabat",            lat: 34.0209,  lon: -6.8417 },
    { name: "Reykjavik",        lat: 64.1355,  lon: -21.8954 },
    { name: "Riga",             lat: 56.9460,  lon: 24.1059 },
    { name: "Rome",             lat: 41.9028,  lon: 12.4964 },
    { name: "San Salvador",     lat: 13.6929,  lon: -89.2182 },
    { name: "Santiago",         lat: -33.4489, lon: -70.6693 },
    { name: "Sarajevo",         lat: 43.8486,  lon: 18.3564 },
    { name: "Seoul",            lat: 37.5665,  lon: 126.9780 },
    { name: "Singapore",        lat: 1.3521,   lon: 103.8198 },
    { name: "Sofia",            lat: 42.6977,  lon: 23.3219 },
    { name: "Stockholm",        lat: 59.3293,  lon: 18.0686 },
    { name: "Tashkent",         lat: 41.2995,  lon: 69.2401 },
    { name: "Tegucigalpa",      lat: 13.9676,  lon: -86.9515 },
    { name: "Thimphu",          lat: 27.4728,  lon: 89.6399 },
    { name: "Tirana",           lat: 41.3275,  lon: 19.8189 },
    { name: "Tokyo",            lat: 35.6762,  lon: 139.6503 },
    { name: "Tripoli",          lat: 32.8872,  lon: 13.1913 },
    { name: "Tunis",            lat: 36.8065,  lon: 10.1815 },
    { name: "Ulaanbaatar",      lat: 47.8864,  lon: 106.9057 },
    { name: "Vaduz",            lat: 47.1415,  lon: 9.5215 },
    { name: "Valletta",         lat: 35.8997,  lon: 14.5147 },
    { name: "Vientiane",        lat: 17.9757,  lon: 102.6331 },
    { name: "Vilnius",          lat: 54.6892,  lon: 25.2798 },
    { name: "Warsaw",           lat: 52.2298,  lon: 21.0118 },
    { name: "Washington, D.C.", lat: 38.9072,  lon: -77.0369 },
    { name: "Wellington",       lat: -41.2867, lon: 174.7752 },
    { name: "Windhoek",         lat: -22.5597, lon: 17.0836 },
    { name: "Yamoussoukro",     lat: 6.8197,   lon: -5.2783 },
    { name: "Yaoundé",          lat: 3.8480,   lon: 11.5021 },
    { name: "Zagreb",           lat: 45.8131,  lon: 15.9780 },
    { name: "Zanzibar City",    lat: -6.1659,  lon: 39.2026 }
  ];

  // 2. Parametri iniziali desktop vs mobile
  var startParams = {
    desktop: { center: [20, 0], zoom: 2 },
    mobile:  { center: [20, 0], zoom: 1 }
  };
  var mql      = window.matchMedia('(max-width:767px)');
  var isMobile = mql.matches;
  var initial  = isMobile ? startParams.mobile : startParams.desktop;

  // 3. Definizione basemap
  var baseMaps = {
    'OpenStreetMap Standard': L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap contributors', noWrap: true }
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
  cities.forEach(function(city) {
    L.marker([city.lat, city.lon])
      .bindPopup('<b>' + city.name + '</b>')
      .on('click', function() {
        map.setView([city.lat, city.lon], 6);
      })
      .addTo(capitali);
  });

  // 5. Inizializzazione mappa
  var map = L.map('map', {
    center:          initial.center,
    zoom:            initial.zoom,
    minZoom:         1,
    worldCopyJump:   true,
    layers:          [ baseMaps['OpenStreetMap Standard'], capitali ],
    scrollWheelZoom:{ wheelPxPerZoomLevel: 300, wheelDebounceTime: 60 },
    zoomDelta:       0.5
  });

  // 6. Limiti e viscosità
  map.setMaxBounds([[-90, -180], [90, 180]]);
  map.options.maxBoundsViscosity = 1.0;

  // 7. Pulsante Home
  map.addControl(new L.Control.Home({
    position:        'topright',
    homeCoordinates: initial.center,
    zoomHome:        initial.zoom
  }));

  // 8. Control layers
  L.control.layers(
    baseMaps,
    { 'Capitali': capitali },
    { collapsed: false, position: 'topright' }
  ).addTo(map);

  // 9. Aggiorna vista al resize
  mql.addEventListener('change', function(e) {
    var opts = e.matches ? startParams.mobile : startParams.desktop;
    map.setView(opts.center, opts.zoom);
  });
});
