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

 // --- Precaricamento tiles dai livelli 5 a 18 ---
function preloadTiles(layer, center, minZoom, maxZoom) {
  const tmpMap = L.map(document.createElement('div'), { attributionControl: false, zoomControl: false });
  tmpMap.setView(center, minZoom);
  layer.addTo(tmpMap);

  for (let z = minZoom; z <= maxZoom; z++) {
    tmpMap.setZoom(z); // forza il caricamento dei tiles a questo zoom
  }

  // rimuovi il layer temporaneo
  tmpMap.remove();
}

// Esempio di utilizzo
preloadTiles(satellite, initialView.center, 3, 10);
preloadTiles(osm, initialView.center, 3, 10);

  // --- Overlay etichette ---
  const labels = L.layerGroup();

  const capitalsData = [
 { name: "Abu Dhabi", coords: [24.4539, 54.3773] },
  { name: "Abuja", coords: [9.0579, 7.4951] },
  { name: "Accra", coords: [5.6037, -0.1870] },
  { name: "Addis Abeba", coords: [9.0300, 38.7400] },
  { name: "Algeri", coords: [36.7538, 3.0588] },
  { name: "Amman", coords: [31.9454, 35.9284] },
  { name: "Amsterdam", coords: [52.3676, 4.9041] },
  { name: "Andorra la Vella", coords: [42.5078, 1.5211] },
  { name: "Ankara", coords: [39.9208, 32.8541] },
  { name: "Antananarivo", coords: [-18.8792, 47.5079] },
  { name: "Apia", coords: [-13.8333, -171.7667] },
  { name: "Asmara", coords: [15.3229, 38.9251] },
  { name: "Asunción", coords: [-25.2637, -57.5759] },
  { name: "Atene", coords: [37.9838, 23.7275] },
  { name: "Baghdad", coords: [33.3152, 44.3661] },
  { name: "Baku", coords: [40.4093, 49.8671] },
  { name: "Bamako", coords: [12.6392, -8.0029] },
  { name: "Bandar Seri Begawan", coords: [4.9031, 114.9398] },
  { name: "Bangkok", coords: [13.7563, 100.5018] },
  { name: "Bangui", coords: [4.3947, 18.5582] },
  { name: "Banjul", coords: [13.4549, -16.5790] },
  { name: "Basseterre", coords: [17.3026, -62.7177] },
  { name: "Beirut", coords: [33.8938, 35.5018] },
  { name: "Belgrado", coords: [44.8176, 20.4569] },
  { name: "Belmopan", coords: [17.2510, -88.7590] },
  { name: "Berlino", coords: [52.5200, 13.4050] },
  { name: "Berna", coords: [46.9481, 7.4474] },
  { name: "Bishkek", coords: [42.8746, 74.5698] },
  { name: "Bissau", coords: [11.8636, -15.5977] },
  { name: "Bogotá", coords: [4.7110, -74.0721] },
  { name: "Brasilia", coords: [-15.7939, -47.8828] },
  { name: "Bratislava", coords: [48.1486, 17.1077] },
  { name: "Brazzaville", coords: [-4.2634, 15.2429] },
  { name: "Bridgetown", coords: [13.0975, -59.6167] },
  { name: "Bruxelles", coords: [50.8503, 4.3517] },
  { name: "Bucarest", coords: [44.4268, 26.1025] },
  { name: "Budapest", coords: [47.4979, 19.0402] },
  { name: "Buenos Aires", coords: [-34.6037, -58.3816] },
  { name: "Cairo", coords: [30.0444, 31.2357] },
  { name: "Canberra", coords: [-35.2809, 149.1300] },
  { name: "Caracas", coords: [10.4806, -66.9036] },
  { name: "Castries", coords: [14.0101, -60.9875] },
  { name: "Chisinau", coords: [47.0105, 28.8638] },
  { name: "Colombo", coords: [6.9271, 79.8612] },
  { name: "Copenaghen", coords: [55.6758, 12.5683] },
  { name: "Dakar", coords: [14.7167, -17.4677] },
  { name: "Damasco", coords: [33.5138, 36.2765] },
  { name: "Dhaka", coords: [23.8103, 90.4125] },
  { name: "Dili", coords: [-8.5569, 125.5603] },
  { name: "Djibouti", coords: [11.5880, 43.1450] },
  { name: "Dodoma", coords: [-6.1630, 35.7516] },
  { name: "Doha", coords: [25.276987, 51.520008] },
  { name: "Dublino", coords: [53.3331, -6.2489] },
  { name: "Freetown", coords: [8.4657, -13.2317] },
  { name: "Funafuti", coords: [-8.5243, 179.1942] },
  { name: "Gaborone", coords: [-24.6282, 25.9231] },
  { name: "Georgetown", coords: [6.8013, -58.1551] },
  { name: "Gitega", coords: [-3.4271, 29.9246] },
  { name: "Hanoi", coords: [21.0285, 105.8542] },
  { name: "Harare", coords: [-17.8292, 31.0522] },
  { name: "Helsinki", coords: [60.1699, 24.9384] },
  { name: "Honiara", coords: [-9.4456, 159.9729] },
  { name: "Islamabad", coords: [33.6844, 73.0479] },
  { name: "Jakarta", coords: [-6.2088, 106.8456] },
  { name: "Kabul", coords: [34.5553, 69.2075] },
  { name: "Kampala", coords: [0.3476, 32.5825] },
  { name: "Kathmandu", coords: [27.7172, 85.3240] },
  { name: "Khartoum", coords: [15.5007, 32.5599] },
  { name: "Kigali", coords: [-1.9706, 30.1044] },
  { name: "Kingston", coords: [17.9712, -76.7936] },
  { name: "Kingstown", coords: [13.1600, -61.2248] },
  { name: "Kinshasa", coords: [-4.4419, 15.2663] },
  { name: "Kuwait City", coords: [29.3759, 47.9774] },
  { name: "La Paz", coords: [-16.5000, -68.1500] },
  { name: "Libreville", coords: [0.4162, 9.4673] },
  { name: "Lilongwe", coords: [-13.9833, 33.7833] },
  { name: "Lima", coords: [-12.0464, -77.0428] },
  { name: "Ljubljana", coords: [46.0569, 14.5058] },
  { name: "Lomé", coords: [6.1725, 1.2314] },
  { name: "Londra", coords: [51.5074, -0.1278] },
  { name: "Luanda", coords: [-8.8390, 13.2894] },
  { name: "Lussemburgo", coords: [49.6117, 6.1319] },
   { name: "Kiev", coords: [50.4501, 30.5234] },
  { name: "Madrid", coords: [40.4168, -3.7038] },
  { name: "Majuro", coords: [7.1164, 171.1858] },
  { name: "Malabo", coords: [3.7500, 8.7833] },
  { name: "Malé", coords: [4.1755, 73.5093] },
  { name: "Managua", coords: [12.1364, -86.2514] },
  { name: "Manama", coords: [26.2285, 50.5860] },
  { name: "Manila", coords: [14.5995, 120.9842] },
  { name: "Maputo", coords: [-25.9653, 32.5892] },
  { name: "Maseru", coords: [-29.3158, 27.4869] },
  { name: "Mbabane", coords: [-26.3054, 31.1367] },
  { name: "Melekeok", coords: [7.5000, 134.6242] },
  { name: "Minsk", coords: [53.9006, 27.5590] },
  { name: "Mogadiscio", coords: [2.0469, 45.3182] },
  { name: "Monaco", coords: [43.7384, 7.4246] },
  { name: "Monrovia", coords: [6.3005, -10.7969] },
  { name: "Montevideo", coords: [-34.9011, -56.1645] },
  { name: "Moroni", coords: [-11.7022, 43.2551] },
  { name: "Mosca", coords: [55.7558, 37.6173] },
  { name: "Nairobi", coords: [-1.2921, 36.8219] },
  { name: "Nassau", coords: [25.0343, -77.3963] },
  { name: "Naypyidaw", coords: [19.7633, 96.0785] },
  { name: "New Delhi", coords: [28.6139, 77.2090] },
  { name: "Niamey", coords: [13.5128, 2.1126] },
  { name: "Nicosia", coords: [35.1856, 33.3823] },
  { name: "Nouakchott", coords: [18.0735, -15.9582] },
  { name: "Nouméa", coords: [-22.2758, 166.4580] },
  { name: "Nuku'alofa", coords: [-21.1394, -175.2049] },
  { name: "Nuuk", coords: [64.1835, -51.7216] },
  { name: "Oslo", coords: [59.9139, 10.7522] },
  { name: "Ottawa", coords: [45.4215, -75.6972] },
  { name: "Ouagadougou", coords: [12.3714, -1.5197] },
  { name: "Palikir", coords: [6.9178, 158.1850] },
  { name: "Panama", coords: [8.9833, -79.5167] },
  { name: "Paramaribo", coords: [5.8520, -55.2038] },
  { name: "Parigi", coords: [48.8566, 2.3522] },
  { name: "Pechino", coords: [39.9042, 116.4074] },
  { name: "Phnom Penh", coords: [11.5564, 104.9282] },
  { name: "Podgorica", coords: [42.4410, 19.2627] },
  { name: "Port Louis", coords: [-20.1609, 57.5012] },
  { name: "Port Moresby", coords: [-9.4438, 147.1803] },
  { name: "Port of Spain", coords: [10.6667, -61.5167] },
  { name: "Port Vila", coords: [-17.7333, 168.3167] },
  { name: "Port-au-Prince", coords: [18.5944, -72.3074] },
  { name: "Porto-Novo", coords: [6.4969, 2.6289] },
  { name: "Praga", coords: [50.0755, 14.4378] },
  { name: "Praia", coords: [14.9330, -23.5133] },
  { name: "Pretoria", coords: [-25.7461, 28.1881] },
  { name: "Pyongyang", coords: [39.0392, 125.7625] },
  { name: "Quito", coords: [-0.1807, -78.4678] },
  { name: "Rabat", coords: [34.0209, -6.8416] },
  { name: "Reykjavík", coords: [64.1355, -21.8954] },
  { name: "Riga", coords: [56.9496, 24.1052] },
  { name: "Riyad", coords: [24.7136, 46.6753] },
  { name: "Roma", coords: [41.9028, 12.4964] },
  { name: "Roseau", coords: [15.3010, -61.3881] },
  { name: "San José", coords: [9.9281, -84.0907] },
  { name: "San Marino", coords: [43.9336, 12.4508] },
  { name: "San Salvador", coords: [13.6929, -89.2182] },
  { name: "Sanaa", coords: [15.3694, 44.1910] },
  { name: "Santiago", coords: [-33.4489, -70.6693] },
  { name: "Santo Domingo", coords: [18.4861, -69.9312] },
  { name: "Sarajevo", coords: [43.8563, 18.4131] },
  { name: "Seoul", coords: [37.5665, 126.9780] },
  { name: "Singapore", coords: [1.3521, 103.8198] },
  { name: "Skopje", coords: [41.9981, 21.4254] },
  { name: "Sofia", coords: [42.6977, 23.3219] },
  { name: "South Tarawa", coords: [1.3278, 172.9769] },
  { name: "Stoccolma", coords: [59.3293, 18.0686] },
  { name: "Sucre", coords: [-19.0196, -65.2619] },
  { name: "Suva", coords: [-18.1248, 178.4501] },
  { name: "Taipei", coords: [25.0330, 121.5654] },
  { name: "Tallinn", coords: [59.4370, 24.7536] },
  { name: "Tashkent", coords: [41.2995, 69.2401] },
  { name: "Tbilisi", coords: [41.7151, 44.8271] },
  { name: "Teheran", coords: [35.6892, 51.3890] },
  { name: "Thimphu", coords: [27.4728, 89.6390] },
  { name: "Tirana", coords: [41.3275, 19.8189] },
  { name: "Tokyo", coords: [35.6895, 139.6917] },
  { name: "Tripoli", coords: [32.8872, 13.1913] },
  { name: "Tunisi", coords: [36.8065, 10.1815] },
  { name: "Ulan Bator", coords: [47.8864, 106.9057] },
  { name: "Vaduz", coords: [47.1416, 9.5215] },
  { name: "Valletta", coords: [35.8997, 14.5146] },
  { name: "Victoria", coords: [-4.6191, 55.4513] },
  { name: "Vienna", coords: [48.2082, 16.3738] },
  { name: "Vientiane", coords: [17.9757, 102.6331] },
  { name: "Vilnius", coords: [54.6872, 25.2797] },
  { name: "Warsaw", coords: [52.2297, 21.0122] },
  { name: "Washington", coords: [38.8951, -77.0364] },
  { name: "Wellington", coords: [-41.2865, 174.7762] },
  { name: "Windhoek", coords: [-22.5597, 17.0832] },
  { name: "Yaoundé", coords: [3.8480, 11.5021] },
  { name: "Yamoussoukro", coords: [6.8276, -5.2893] },
  { name: "Yerevan", coords: [40.1792, 44.4991] },
  { name: "Zagabria", coords: [45.8150, 15.9819] } 
  ];

// --- Crea etichette capitali cliccabili ---
  capitalsData.forEach(({ name, coords }) => {
    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'capital-label',
        html: `<div class="capital-box">${name}</div>`,
        iconAnchor: [50, 20]
      })
    });

    // Evento click: flyTo sul marker a zoom 14
    label.on('click', () => {
      map.flyTo(coords, 14, { animate: true, duration: 2, easeLinearity: 0.25 });
    });

    labels.addLayer(label);
  });

  // --- Crea mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [satellite],
    zoomControl: true,
    minZoom: 3,
    maxBounds: [
      [-90, -180],
      [90, 180]
    ],
    maxBoundsViscosity: 1.0
  });

  // --- Aggiungi etichette alla mappa ---
  labels.addTo(map);

  // --- FlyTo iniziale ---
  map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 2, easeLinearity: 0.25 });

  // --- CSS etichette ---
  const style = document.createElement('style');
  style.innerHTML = `
   .capital-box {
  display: inline-block;      /* permette al div di adattarsi al contenuto */
  background: white;
  color: black;
  font-size: 14px;
  padding: 4px 8px;           /* spazio intorno al testo */
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  white-space: nowrap;         /* impedisce al testo di andare a capo */
  cursor: pointer;
  min-width: fit-content;      /* il box non sarà mai più piccolo del testo */
  text-align: center;          /* centra il testo dentro il box */
}
  `;
  document.head.appendChild(style);

  // --- SWITCHER layer ---
  const layersControl = L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": labels },
    { collapsed: true }
  ).addTo(map);

  // --- Box Home + Locate ---
  const controlBox = L.control({ position: 'topright' });
  controlBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');
    container.style.marginTop = '10px';
    container.style.marginRight = '0';
    container.style.border = 'none';
    container.style.background = 'transparent';
    container.style.padding = '0';

    // Pulsante Home
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🏠';
    homeBtn.title = "Torna alla vista iniziale";
    homeBtn.style.fontSize = '30px';
    homeBtn.style.width = '45px';
    homeBtn.style.height = '45px';
    homeBtn.style.lineHeight = '50px';
    homeBtn.style.textAlign = 'center';
    homeBtn.style.display = 'block';
    homeBtn.style.background = 'white';
    homeBtn.style.borderRadius = '4px';
    homeBtn.style.marginBottom = '3px';

    L.DomEvent.on(homeBtn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, { animate: true,  duration: 2, easeLinearity: 0.25 });
    });

    // Pulsante Locate
    const locateControl = L.control.locate({
      flyTo: { duration: 2, easeLinearity: 0.25 },
      strings: { title: "Mostrami la mia posizione" },
      locateOptions: { enableHighAccuracy: true, watch: false }
    });
    const locateBtn = locateControl.onAdd(map);

    locateBtn.style.width = '45px';
    locateBtn.style.height = '45px';
    locateBtn.style.background = 'white';
    locateBtn.style.lineHeight = '50px';
    locateBtn.style.border = 'none';
    locateBtn.style.borderRadius = '8px';

    container.appendChild(locateBtn);

    return container;
  };
  controlBox.addTo(map);
  map.on('zoomend', () => {
    const zoom = map.getZoom();
    const labels = document.querySelectorAll('.capital-box');

    labels.forEach(label => {
      if (zoom < 4) {
        label.style.fontSize = '8px';
      } else if (zoom < 6) {
        label.style.fontSize = '10px';
      } else if (zoom < 8) {
        label.style.fontSize = '12px';
      } else {
        label.style.fontSize = '14px';
      }
    });
  });
});
