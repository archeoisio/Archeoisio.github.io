document.addEventListener('DOMContentLoaded', () => {
  // --- Configurazioni viewport ---
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [50, 22], zoom: 4 };
  const desktopView = { center: [44, 30], zoom: 5 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  const southWest = L.latLng(-90, -180);
  const northEast = L.latLng(90, 193);
  const maxBounds = L.latLngBounds(southWest, northEast);

  // --- Layer base ---
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { noWrap: false });
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { noWrap: false }
  );

  // --- Mappa ---
  const map = L.map('map', {
    center: initialView.center,
    zoom: initialView.zoom,
    layers: [satellite],
    zoomControl: true,
    minZoom: isMobile ? 2.5 : 2.5,
    maxZoom: 18,
    worldCopyJump: true,
    maxBounds: maxBounds,
    maxBoundsViscosity: 1,
    wheelPxPerZoomLevel: 120,
    zoomSnap: 0.1,
    attributionControl: false
  });

  // --- Funzione per altezza viewport ---
  function setVh() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--vh', vh + 'px');
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.height = vh + 'px';
    setTimeout(() => map.invalidateSize(), 100);
  }
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);

  // --- Overlay capitali ---
  const labels = L.layerGroup();
  let lastMarker = null;
  let searchMarkers = [];
  let control = null;


  // --- Dati capitali (esempio breve, inserisci tutti i tuoi dati) ---
  const capitalsData = [
{ name: "Abu Dhabi", nation: "United Arab Emirates", coords: [24.4539, 54.3773], flag: "🇦🇪" },
{ name: "Abuja", nation: "Nigeria", coords: [9.0579, 7.4951], flag: "🇳🇬" },
{ name: "Accra", nation: "Ghana", coords: [5.6037, -0.1870], flag: "🇬🇭" },
{ name: "Addis Ababa", nation: "Ethiopia", coords: [9.0300, 38.7400], flag: "🇪🇹" },
{ name: "Algiers", nation: "Algeria", coords: [36.7538, 3.0588], flag: "🇩🇿" },
{ name: "Amman", nation: "Jordan", coords: [31.9454, 35.9284], flag: "🇯🇴" },
{ name: "Amsterdam", nation: "Netherlands", coords: [52.3676, 4.9041], flag: "🇳🇱" },
{ name: "Andorra", nation: "Andorra", coords: [42.5078, 1.5211], flag: "🇦🇩" },
{ name: "Ankara", nation: "Turkey", coords: [39.9208, 32.8541], flag: "🇹🇷" },
{ name: "Antananarivo", nation: "Madagascar", coords: [-18.8792, 47.5079], flag: "🇲🇬" },
{ name: "Apia", nation: "Samoa", coords: [-13.8333, -171.7667], flag: "🇼🇸" },
{ name: "Ashgabat", nation: "Turkmenistan", coords: [37.9601, 58.3261], flag: "🇹🇲" },
{ name: "Asmara", nation: "Eritrea", coords: [15.3229, 38.9251], flag: "🇪🇷" },
{ name: "Asuncion", nation: "Paraguay", coords: [-25.2637, -57.5759], flag: "🇵🇾" },
{ name: "Athens", nation: "Greece", coords: [37.9838, 23.7275], flag: "🇬🇷" },
{ name: "Baghdad", nation: "Iraq", coords: [33.3152, 44.3661], flag: "🇮🇶" },
{ name: "Baku", nation: "Azerbaijan", coords: [40.4093, 49.8671], flag: "🇦🇿" },
{ name: "Bamako", nation: "Mali", coords: [12.6392, -8.0029], flag: "🇲🇱" },
{ name: "Bandar Seri Begawan", nation: "Brunei", coords: [4.9031, 114.9398], flag: "🇧🇳" },
{ name: "Bangkok", nation: "Thailand", coords: [13.7563, 100.5018], flag: "🇹🇭" },
{ name: "Bangui", nation: "Central African Republic", coords: [4.3947, 18.5582], flag: "🇨🇫" },
{ name: "Banjul", nation: "Gambia", coords: [13.4549, -16.5790], flag: "🇬🇲" },
{ name: "Basseterre", nation: "Saint Kitts and Nevis", coords: [17.3026, -62.7177], flag: "🇰🇳" },
{ name: "Beijing", nation: "China", coords: [39.9042, 116.4074], flag: "🇨🇳" },
{ name: "Beirut", nation: "Lebanon", coords: [33.8938, 35.5018], flag: "🇱🇧" },
{ name: "Belgrade", nation: "Serbia", coords: [44.8176, 20.4569], flag: "🇷🇸" },
{ name: "Belmopan", nation: "Belize", coords: [17.2510, -88.7590], flag: "🇧🇿" },
{ name: "Berlin", nation: "Germany", coords: [52.5200, 13.4050], flag: "🇩🇪" },
{ name: "Bern", nation: "Switzerland", coords: [46.9481, 7.4474], flag: "🇨🇭" },
{ name: "Bishkek", nation: "Kyrgyzstan", coords: [42.8746, 74.5698], flag: "🇰🇬" },
{ name: "Bissau", nation: "Guinea-Bissau", coords: [11.8636, -15.5977], flag: "🇬🇼" },
{ name: "Bogota", nation: "Colombia", coords: [4.7110, -74.0721], flag: "🇨🇴" },
{ name: "Brasilia", nation: "Brazil", coords: [-15.7939, -47.8828], flag: "🇧🇷" },
{ name: "Bratislava", nation: "Slovakia", coords: [48.1486, 17.1077], flag: "🇸🇰" },
{ name: "Brazzaville", nation: "Republic of the Congo", coords: [-4.2634, 15.2429], flag: "🇨🇬" },
{ name: "Bridgetown", nation: "Barbados", coords: [13.0975, -59.6167], flag: "🇧🇧" },
{ name: "Brussels", nation: "Belgium", coords: [50.8503, 4.3517], flag: "🇧🇪" },
{ name: "Bucharest", nation: "Romania", coords: [44.4268, 26.1025], flag: "🇷🇴" },
{ name: "Budapest", nation: "Hungary", coords: [47.4979, 19.0402], flag: "🇭🇺" },
{ name: "Buenos Aires", nation: "Argentina", coords: [-34.6037, -58.3816], flag: "🇦🇷" },
{ name: "Cairo", nation: "Egypt", coords: [30.0444, 31.2357], flag: "🇪🇬" },
{ name: "Canberra", nation: "Australia", coords: [-35.2809, 149.1300], flag: "🇦🇺" },
{ name: "Caracas", nation: "Venezuela", coords: [10.4806, -66.9036], flag: "🇻🇪" },
{ name: "Castries", nation: "Saint Lucia", coords: [14.0101, -60.9875], flag: "🇱🇨" },
{ name: "Chisinau", nation: "Moldova", coords: [47.0105, 28.8638], flag: "🇲🇩" },
{ name: "Colombo", nation: "Sri Lanka", coords: [6.9271, 79.8612], flag: "🇱🇰" },
{ name: "Copenhagen", nation: "Denmark", coords: [55.6758, 12.5683], flag: "🇩🇰" },
{ name: "Dakar", nation: "Senegal", coords: [14.7167, -17.4677], flag: "🇸🇳" },
{ name: "Damascus", nation: "Syria", coords: [33.5138, 36.2765], flag: "🇸🇾" },
{ name: "Dhaka", nation: "Bangladesh", coords: [23.8103, 90.4125], flag: "🇧🇩" },
{ name: "Dili", nation: "Timor-Leste", coords: [-8.5569, 125.5603], flag: "🇹🇱" },
{ name: "Djibouti", nation: "Djibouti", coords: [11.5880, 43.1450], flag: "🇩🇯" },
{ name: "Dodoma", nation: "Tanzania", coords: [-6.1630, 35.7516], flag: "🇹🇿" },
{ name: "Doha", nation: "Qatar", coords: [25.276987, 51.520008], flag: "🇶🇦" },
{ name: "Dublin", nation: "Ireland", coords: [53.3331, -6.2489], flag: "🇮🇪" },
{ name: "Freetown", nation: "Sierra Leone", coords: [8.4657, -13.2317], flag: "🇸🇱" },
{ name: "Gaborone", nation: "Botswana", coords: [-24.6282, 25.9231], flag: "🇧🇼" },
{ name: "Georgetown", nation: "Guyana", coords: [6.8013, -58.1551], flag: "🇬🇾" },
{ name: "Gitega", nation: "Burundi", coords: [-3.4271, 29.9246], flag: "🇧🇮" },
{ name: "Hanoi", nation: "Vietnam", coords: [21.0285, 105.8542], flag: "🇻🇳" },
{ name: "Harare", nation: "Zimbabwe", coords: [-17.8292, 31.0522], flag: "🇿🇼" },
{ name: "Helsinki", nation: "Finland", coords: [60.1699, 24.9384], flag: "🇫🇮" },
{ name: "Honiara", nation: "Solomon Islands", coords: [-9.4456, 159.9729], flag: "🇸🇧" },
{ name: "Islamabad", nation: "Pakistan", coords: [33.6844, 73.0479], flag: "🇵🇰" },
{ name: "Jakarta", nation: "Indonesia", coords: [-6.2088, 106.8456], flag: "🇮🇩" },
{ name: "Kabul", nation: "Afghanistan", coords: [34.5553, 69.2075], flag: "🇦🇫" },
{ name: "Kampala", nation: "Uganda", coords: [0.3476, 32.5825], flag: "🇺🇬" },
{ name: "Kathmandu", nation: "Nepal", coords: [27.7172, 85.3240], flag: "🇳🇵" },
{ name: "Khartoum", nation: "Sudan", coords: [15.5007, 32.5599], flag: "🇸🇩" },
{ name: "Kigali", nation: "Rwanda", coords: [-1.9706, 30.1044], flag: "🇷🇼" },
{ name: "Kingston", nation: "Jamaica", coords: [17.9712, -76.7936], flag: "🇯🇲" },
{ name: "Kingstown", nation: "Saint Vincent and the Grenadines", coords: [13.1600, -61.2248], flag: "🇻🇨" },
{ name: "Kinshasa", nation: "Democratic Republic of the Congo", coords: [-4.4419, 15.2663], flag: "🇨🇩" },
{ name: "Kuwait City", nation: "Kuwait", coords: [29.3759, 47.9774], flag: "🇰🇼" },
{ name: "La Paz", nation: "Bolivia", coords: [-16.5000, -68.1193], flag: "🇧🇴" },
{ name: "Libreville", nation: "Gabon", coords: [0.4162, 9.4673], flag: "🇬🇦" },
{ name: "Lilongwe", nation: "Malawi", coords: [-13.9833, 33.7833], flag: "🇲🇼" },
{ name: "Lima", nation: "Peru", coords: [-12.0464, -77.0428], flag: "🇵🇪" },
{ name: "Lisbon", nation: "Portugal", coords: [38.7169, -9.1390], flag: "🇵🇹" },
{ name: "Ljubljana", nation: "Slovenia", coords: [46.0569, 14.5058], flag: "🇸🇮" },
{ name: "Lomé", nation: "Togo", coords: [6.1375, 1.2123], flag: "🇹🇬" },
{ name: "London", nation: "United Kingdom", coords: [51.5074, -0.1278], flag: "🇬🇧" },
{ name: "Luanda", nation: "Angola", coords: [-8.8383, 13.2344], flag: "🇦🇴" },
{ name: "Lusaka", nation: "Zambia", coords: [-15.4167, 28.2833], flag: "🇿🇲" },
{ name: "Luxembourg", nation: "Luxembourg", coords: [49.6117, 6.1319], flag: "🇱🇺" },
{ name: "Madrid", nation: "Spain", coords: [40.4168, -3.7038], flag: "🇪🇸" },
{ name: "Majuro", nation: "Marshall Islands", coords: [7.1167, 171.3667], flag: "🇲🇭" },
{ name: "Malabo", nation: "Equatorial Guinea", coords: [3.7523, 8.7741], flag: "🇬🇶" },
{ name: "Malé", nation: "Maldives", coords: [4.1755, 73.5093], flag: "🇲🇻" },
{ name: "Managua", nation: "Nicaragua", coords: [12.1364, -86.2514], flag: "🇳🇮" },
{ name: "Manama", nation: "Bahrain", coords: [26.2154, 50.5832], flag: "🇧🇭" },
{ name: "Manila", nation: "Philippines", coords: [14.5995, 120.9842], flag: "🇵🇭" },
{ name: "Maputo", nation: "Mozambique", coords: [-25.9667, 32.5833], flag: "🇲🇿" },
{ name: "Maseru", nation: "Lesotho", coords: [-29.3167, 27.4833], flag: "🇱🇸" },
{ name: "Mbabane", nation: "Eswatini", coords: [-26.3167, 31.1333], flag: "🇸🇿" },
{ name: "Mexico City", nation: "Mexico", coords: [19.4333, -99.1333], flag: "🇲🇽" },
{ name: "Minsk", nation: "Belarus", coords: [53.9006, 27.5590], flag: "🇧🇾" },
{ name: "Mogadishu", nation: "Somalia", coords: [2.0419, 45.3269], flag: "🇸🇴" },
{ name: "Monaco", nation: "Monaco", coords: [43.7333, 7.4167], flag: "🇲🇨" },
{ name: "Monrovia", nation: "Liberia", coords: [6.3005, -10.7972], flag: "🇱🇷" },
{ name: "Montevideo", nation: "Uruguay", coords: [-34.9033, -56.1882], flag: "🇺🇾" },
{ name: "Moroni", nation: "Comoros", coords: [-11.7022, 43.2551], flag: "🇰🇲" },
{ name: "Moscow", nation: "Russia", coords: [55.7558, 37.6173], flag: "🇷🇺" },
{ name: "Muscat", nation: "Oman", coords: [23.6139, 58.5922], flag: "🇴🇲" },
{ name: "Nairobi", nation: "Kenya", coords: [-1.2864, 36.8172], flag: "🇰🇪" },
{ name: "Nassau", nation: "Bahamas", coords: [25.0600, -77.3450], flag: "🇧🇸" },
{ name: "Naypyidaw", nation: "Myanmar", coords: [19.7450, 96.1297], flag: "🇲🇲" },
{ name: "N'Djamena", nation: "Chad", coords: [12.1348, 15.0557], flag: "🇹🇩" },
{ name: "New Delhi", nation: "India", coords: [28.6139, 77.2090], flag: "🇮🇳" },
{ name: "Niamey", nation: "Niger", coords: [13.5127, 2.1128], flag: "🇳🇪" },
{ name: "Nicosia", nation: "Cyprus", coords: [35.1856, 33.3823], flag: "🇨🇾" },
{ name: "Nouakchott", nation: "Mauritania", coords: [18.0790, -15.9785], flag: "🇲🇷" },
{ name: "Nukuʻalofa", nation: "Tonga", coords: [-21.1333, -175.2000], flag: "🇹🇴" },
{ name: "Oslo", nation: "Norway", coords: [59.9139, 10.7522], flag: "🇳🇴" },
{ name: "Ottawa", nation: "Canada", coords: [45.4215, -75.6972], flag: "🇨🇦" },
{ name: "Ouagadougou", nation: "Burkina Faso", coords: [12.3714, -1.5197], flag: "🇧🇫" },
{ name: "Palikir", nation: "Micronesia", coords: [6.9177, 158.1856], flag: "🇫🇲" },
{ name: "Panama City", nation: "Panama", coords: [8.9833, -79.5167], flag: "🇵🇦" },
{ name: "Paramaribo", nation: "Suriname", coords: [5.8664, -55.1668], flag: "🇸🇷" },
{ name: "Paris", nation: "France", coords: [48.8566, 2.3522], flag: "🇫🇷" },
{ name: "Phnom Penh", nation: "Cambodia", coords: [11.5564, 104.9282], flag: "🇰🇭" },
{ name: "Podgorica", nation: "Montenegro", coords: [42.4410, 19.2627], flag: "🇲🇪" },
{ name: "Port Louis", nation: "Mauritius", coords: [-20.1609, 57.5012], flag: "🇲🇺" },
{ name: "Port Moresby", nation: "Papua New Guinea", coords: [-9.4431, 147.1797], flag: "🇵🇬" },
{ name: "Port-au-Prince", nation: "Haiti", coords: [18.5944, -72.3074], flag: "🇭🇹" },
{ name: "Port of Spain", nation: "Trinidad and Tobago", coords: [10.6667, -61.5167], flag: "🇹🇹" },
{ name: "Port Vila", nation: "Vanuatu", coords: [-17.7333, 168.3167], flag: "🇻🇺" },
{ name: "Porto-Novo", nation: "Benin", coords: [6.4969, 2.6289], flag: "🇧🇯" },
{ name: "Prague", nation: "Czech Republic", coords: [50.0755, 14.4378], flag: "🇨🇿" },
{ name: "Praia", nation: "Cape Verde", coords: [14.9167, -23.5167], flag: "🇨🇻" },
{ name: "Pretoria", nation: "South Africa", coords: [-25.7461, 28.1881], flag: "🇿🇦" },
{ name: "Pyongyang", nation: "North Korea", coords: [39.0194, 125.7381], flag: "🇰🇵" },
{ name: "Quito", nation: "Ecuador", coords: [-0.1807, -78.4678], flag: "🇪🇨" },
{ name: "Rabat", nation: "Morocco", coords: [34.0209, -6.8416], flag: "🇲🇦" },
{ name: "Reykjavik", nation: "Iceland", coords: [64.1355, -21.8954], flag: "🇮🇸" },
{ name: "Riga", nation: "Latvia", coords: [56.9496, 24.1052], flag: "🇱🇻" },
{ name: "Riyadh", nation: "Saudi Arabia", coords: [24.7136, 46.6753], flag: "🇸🇦" },
{ name: "Rome", nation: "Italy", coords: [41.9028, 12.4964], flag: "🇮🇹" },
{ name: "Roseau", nation: "Dominica", coords: [15.3010, -61.3870], flag: "🇩🇲" },
{ name: "San José", nation: "Costa Rica", coords: [9.9333, -84.0833], flag: "🇨🇷" },
{ name: "San Marino", nation: "San Marino", coords: [43.9336, 12.4508], flag: "🇸🇲" },
{ name: "San Salvador", nation: "El Salvador", coords: [13.6929, -89.2182], flag: "🇸🇻" },
{ name: "Sana'a", nation: "Yemen", coords: [15.3694, 44.1910], flag: "🇾🇪" },
{ name: "Santiago", nation: "Chile", coords: [-33.4489, -70.6693], flag: "🇨🇱" },
{ name: "Santo Domingo", nation: "Dominican Republic", coords: [18.4861, -69.9312], flag: "🇩🇴" },
{ name: "São Tomé", nation: "São Tomé and Príncipe", coords: [0.3365, 6.7273], flag: "🇸🇹" },
{ name: "Sarajevo", nation: "Bosnia and Herz.", coords: [43.8563, 18.4131], flag: "🇧🇦" },
{ name: "Seoul", nation: "South Korea", coords: [37.5665, 126.9780], flag: "🇰🇷" },
{ name: "Singapore", nation: "Singapore", coords: [1.3521, 103.8198], flag: "🇸🇬" },
{ name: "Skopje", nation: "North Macedonia", coords: [41.9981, 21.4254], flag: "🇲🇰" },
{ name: "Sofia", nation: "Bulgaria", coords: [42.6977, 23.3219], flag: "🇧🇬" },
{ name: "Stockholm", nation: "Sweden", coords: [59.3293, 18.0686], flag: "🇸🇪" },
{ name: "Suva", nation: "Fiji", coords: [-18.1416, 178.4419], flag: "🇫🇯" },
{ name: "Tallinn", nation: "Estonia", coords: [59.4370, 24.7536], flag: "🇪🇪" },
{ name: "Tarawa Atoll", nation: "Kiribati", coords: [1.3278, 172.9770], flag: "🇰🇮" },
{ name: "Tashkent", nation: "Uzbekistan", coords: [41.2995, 69.2401], flag: "🇺🇿" },
{ name: "Tbilisi", nation: "Georgia", coords: [41.7151, 44.8271], flag: "🇬🇪" },
{ name: "Tegucigalpa", nation: "Honduras", coords: [14.0818, -87.2068], flag: "🇭🇳" },
{ name: "Tehran", nation: "Iran", coords: [35.6892, 51.3890], flag: "🇮🇷" },
{ name: "Thimphu", nation: "Bhutan", coords: [27.4728, 89.6390], flag: "🇧🇹" },
{ name: "Tirana", nation: "Albania", coords: [41.3275, 19.8189], flag: "🇦🇱" },
{ name: "Tokyo", nation: "Japan", coords: [35.6895, 139.6917], flag: "🇯🇵" },
{ name: "Tripoli", nation: "Libya", coords: [32.8872, 13.1913], flag: "🇱🇾" },
{ name: "Tunis", nation: "Tunisia", coords: [36.8065, 10.1815], flag: "🇹🇳" },
{ name: "Ulaanbaatar", nation: "Mongolia", coords: [47.8864, 106.9057], flag: "🇲🇳" },
{ name: "Vaduz", nation: "Liechtenstein", coords: [47.1416, 9.5215], flag: "🇱🇮" },
{ name: "Valletta", nation: "Malta", coords: [35.8997, 14.5146], flag: "🇲🇹" },
{ name: "Vatican City", nation: "Holy See", coords: [41.9029, 12.4534], flag: "🇻🇦" },
{ name: "Victoria", nation: "Seychelles", coords: [-4.6191, 55.4513], flag: "🇸🇨" },
{ name: "Vienna", nation: "Austria", coords: [48.2082, 16.3738], flag: "🇦🇹" },
{ name: "Vientiane", nation: "Laos", coords: [17.9757, 102.6331], flag: "🇱🇦" },
{ name: "Vilnius", nation: "Lithuania", coords: [54.6872, 25.2797], flag: "🇱🇹" },
{ name: "Warsaw", nation: "Poland", coords: [52.2297, 21.0122], flag: "🇵🇱" },
{ name: "Washington D.C.", nation: "United States", coords: [38.8951, -77.0364], flag: "🇺🇸" },
{ name: "Wellington", nation: "New Zealand", coords: [-41.2865, 174.7762], flag: "🇳🇿" },
{ name: "Windhoek", nation: "Namibia", coords: [-22.5597, 17.0832], flag: "🇳🇦" },
{ name: "Yamoussoukro", nation: "Ivory Coast", coords: [6.8276, -5.2893], flag: "🇨🇮" },
{ name: "Yaoundé", nation: "Cameroon", coords: [3.8480, 11.5021], flag: "🇨🇲" },
{ name: "Yerevan", nation: "Armenia", coords: [40.1792, 44.4991], flag: "🇦🇲" },
{ name: "Zagreb", nation: "Croatia", coords: [45.8150, 15.9819], flag: "🇭🇷" },
{ name: "Saint John's", nation: "Antigua e Barbuda", coords: [17.1274, -61.8468], flag: "🇦🇬" },
{ name: "St. George's", nation: "Grenada", coords: [12.0561, -61.7486], flag: "🇬🇩" },
{ name: "Guatemala City", nation: "Guatemala", coords: [14.6349, -90.5069], flag: "🇬🇹" },
{ name: "Conakry", nation: "Guinea", coords: [9.5092, -13.7122], flag: "🇬🇳" },
{ name: "Kuala Lumpur", nation: "Malesia", coords: [3.1390, 101.6869], flag: "🇲🇾" },
{ name: "Juba", nation: "Sud Sudan", coords: [4.8517, 31.5825], flag: "🇸🇸" },
{ name: "Dushanbe", nation: "Tagikistan", coords: [38.5598, 68.7870], flag: "🇹🇯" },
{ name: "Tel Aviv", nation: "Israel", coords: [32.0853, 34.7818], flag: "🇮🇱" },
{ name: "Ramallah", nation: "Palestine", coords: [31.8990, 35.2048], flag: "🇵🇸" },
{ name: "Havana", nation: "Cuba", coords: [23.1136, -82.3666], flag: "🇨🇺" },
{ name: "Nur-Sultan", nation: "Kazakhstan", coords: [51.1694, 71.4491], flag: "🇰🇿" },
{ name: "Yaren", nation: "Nauru", coords: [-0.5477, 166.9209], flag: "🇳🇷" },
{ name: "Ngerulmud", nation: "Palau", coords: [7.5004, 134.6245], flag: "🇵🇼" },
{ name: "Funafuti", nation: "Tuvalu", coords: [-8.5211, 179.1962], flag: "🇹🇻" },
{ name: "Kyiv", nation: "Ukraine", coords: [50.4501, 30.5234], flag: "🇺🇦" }

];

  capitalsData.forEach(({ name, nation, coords, flag }) => {
    const marker = L.marker(coords, {
      icon: L.divIcon({
        className: 'flag-icon',
        html: `<div class="flag-box">${flag}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
  }),
  zIndexOffset: 1000 // molto alto, per essere sopra gli altri marker
});

    marker.on('click', () => {
      const panel = document.getElementById('info-panel');
      const content = document.getElementById('info-content');
      if (!panel || !content) return;

      if (lastMarker === marker) {
        panel.style.display = 'none';
        lastMarker = null;
        return;
      }

      content.innerHTML = `
        <div style="font-size:15px;font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
          ${nation} ${flag}
        </div>
        <div style="font-size:14px;font-weight:bold; color:white;">
          ${name}
          <button id="fly-btn" style="background:none;border:none;color:white;cursor:pointer;font-size:14px; padding:0; margin-left:4px;">🔍</button>
        </div>
      `;
      panel.style.display = 'block';
      lastMarker = marker;

      document.getElementById('fly-btn').addEventListener('click', () => {
        map.flyTo(coords, 14, { animate: true, duration: 3 });
      });
    });

    labels.addLayer(marker);
  });
  labels.addTo(map);

  // --- LAYER 2: CONFINI NAZIONI ---
  const bordersLayer = L.layerGroup();
  const bordersUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';

  fetch(bordersUrl)
    .then(r => { if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => {
                const fixRing = (ring) => {
                ring.forEach(coord => {
                    // TUA SOLUZIONE ESTESA:
                    // Se è Russia oltre lo stretto di Bering (> 60 Nord)
                    // OPPURE se sono isole del pacifico (< 0 Sud e molto a Ovest)
                    if ( (coord[0] < -168.5 && coord[1] > 60) || (coord[0] < -165 && coord[1] < 0) ) {
                        coord[0] += 360;
                    }
                });
            };

            if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => polygon.forEach(ring => fixRing(ring)));
            } else if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates.forEach(ring => fixRing(ring));
            }
        }
      });
      // ----------------

      const geoJsonLayer = L.geoJSON(data, {
        interactive: false,
        style: {
          color: '#4a90e2', 
          weight: 1,       // Se metti 0 la riga verticale sparisce, ma perdi i confini
          fillColor: '#4a90e2', 
          fillOpacity: 0.1
        }
      });
      bordersLayer.addLayer(geoJsonLayer);
    })
    .catch(err => console.error("Errore caricamento confini:", err));
  
  bordersLayer.addTo(map);
  
  // --- Layer switcher ---
L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm }, 
    { "Capitali": labels, "Confini": bordersLayer }, // <--- Aggiunto qui
    { collapsed: true }
).addTo(map);

// --- Controlli Home, Locate, Routing a due colonne ---
const controlBox = L.control({ position: 'topright' });

controlBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-control-box leaflet-bar');

    // Stile container principale
    container.style.display = 'flex';
    container.style.marginTop = '-2px';
    container.style.marginRight = '7px';
    container.style.background = 'transparent';
    container.style.padding = '5px';
    container.style.border = 'none';
    container.style.alignItems = 'flex-start';

  // --- Colonna sinistra: box routing ---


  const routeBox = L.DomUtil.create('div', '', container);
    routeBox.id = 'route-box';
   routeBox.style.marginTop = '10px';  // distanza dal top della mappa 
    routeBox.style.width = '150px';
    routeBox.style.display = 'none';
    routeBox.style.flexDirection = 'column';
    routeBox.style.background = 'transparent';
    routeBox.style.color = 'white';
    routeBox.style.border = 'none';
    routeBox.style.padding = '8px';
    routeBox.style.borderRadius = '5px';
    routeBox.style.boxSizing = 'border-box';

    // Inputs e pulsanti routing
    const startInput = document.createElement('input');
    startInput.id = 'start';
    startInput.placeholder = 'Partenza';
    startInput.style.marginBottom = '4px';
 startInput.style.width = '100%';
startInput.style.boxSizing = 'border-box';


    routeBox.appendChild(startInput);

    const endInput = document.createElement('input');
    endInput.id = 'end';
    endInput.placeholder = 'Destinazione';
    endInput.style.marginBottom = '4px';
   endInput.style.width = '100%';
endInput.style.boxSizing = 'border-box';
    routeBox.appendChild(endInput);

  const buttonRow = document.createElement('div');
buttonRow.style.display = 'flex';
buttonRow.style.gap = '4px'; // spazio tra i bottoni

// Pulsante Calcola
const calcBtn = document.createElement('button');
calcBtn.id = 'route-btn';
calcBtn.innerText = 'Calcola';
calcBtn.style.flex = '1';
calcBtn.style.minWidth = '0'; // importante per mobile
calcBtn.style.display = 'flex';
calcBtn.style.borderRadius = '8px'; // angoli smussati
calcBtn.style.alignItems = 'center';
calcBtn.style.justifyContent = 'center';

buttonRow.appendChild(calcBtn);

// Pulsante Reset
const clearBtn = document.createElement('button');
clearBtn.id = 'clear-btn';
clearBtn.innerText = 'Reset';
clearBtn.style.flex = '1';
clearBtn.style.minWidth = '0'; // importante per mobile
  clearBtn.style.display = 'flex';
clearBtn.style.justifyContent = 'center';
clearBtn.style.borderRadius = '8px'; // angoli smussati
  buttonRow.appendChild(clearBtn);
// aggiungi i bottoni al routeBox
routeBox.appendChild(buttonRow);

 // --- Geocoder semplice ---
const geocoderControl = L.Control.geocoder({
    collapsed: true,           // input sempre visibile
    placeholder: "Cerca...",
    defaultMarkGeocode: true
}).addTo(map);

// Prendi il container del geocoder
const geocoderContainer = geocoderControl.getContainer();

// Appendi il geocoder dentro routeBox
routeBox.appendChild(geocoderContainer);

  // --- Colonna destra: pulsanti verticali ---
    const btnCol = L.DomUtil.create('div', '', container);
    btnCol.style.display = 'flex';
    btnCol.style.flexDirection = 'column';
    btnCol.style.gap = '5px';

    // Home
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', btnCol);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🏠';
    homeBtn.title = "Torna alla vista iniziale";
    L.DomEvent.on(homeBtn, 'click', e => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 2 });
    });

    // Locate
    const locateControl = L.control.locate({
        flyTo: { duration: 2 },
        strings: { title: "Mostrami la mia posizione" },
        locateOptions: { enableHighAccuracy: true }
    });
    btnCol.appendChild(locateControl.onAdd(map));

    // Routing button (toggle visibilità box route)
    const routeBtn = L.DomUtil.create('a', 'custom-home-button', btnCol);
    routeBtn.href = '#';
    routeBtn.innerHTML = '🗺️';
    routeBtn.title = "Mostra/Nascondi indicazioni";
    L.DomEvent.on(routeBtn, 'click', e => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        routeBox.style.display = (routeBox.style.display === 'none') ? 'flex' : 'none';
    });

    return container;
};

controlBox.addTo(map);

  // --- Funzioni utility ---
  async function geocode(query) {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.length === 0) throw new Error(`Località non trovata: ${query}`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }

  async function calculateRoute(start, end) {
    if (!start || !end) { alert("Inserisci sia punto di partenza che destinazione!"); return; }

    try {
      const startCoords = await geocode(start);
      const endCoords = await geocode(end);

      // Rimuove vecchi marker e controllo routing
      searchMarkers.forEach(m => map.removeLayer(m));
      searchMarkers = [];
      if (control) { map.removeControl(control); control = null; }

      // Nuovo controllo routing
      control = L.Routing.control({
        waypoints: [L.latLng(startCoords[0], startCoords[1]), L.latLng(endCoords[0], endCoords[1])],
        routeWhileDragging: true,
        addWaypoints: true,
        draggableWaypoints: true,
        showAlternatives: false,
        show: false,
        lineOptions: { styles: [{ color: 'blue', weight: 5, opacity: 0.7 }] },
        createMarker: function(i, wp, nWps) {
  const color = i === 0 ? 'green' : i === nWps-1 ? 'red' : 'blue';
  let label;
  if (i === 0) label = 'Partenza';
  else if (i === nWps-1) label = 'Arrivo';
  else label = `Waypoint ${i}`; // numerazione progressiva

  const marker = L.marker(wp.latLng, {
    draggable: i !== 0 && i !== nWps-1,
    icon: L.divIcon({
      className: 'routing-marker',
      html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  });

  // Qui il popup classico
  marker.bindPopup(`<b>${label}</b>`);

  searchMarkers.push(marker);
  return marker;
}
      }).addTo(map);

// --- Forza il comportamento "collapsible" anche su desktop ---
const routingContainer = document.querySelector('.leaflet-routing-container');
if (routingContainer) {
  routingContainer.classList.add('leaflet-routing-collapsible');
  routingContainer.classList.remove('leaflet-routing-container-hide');
}
      // Zoom automatico sul percorso
     control.on('routesfound', e => {
  const route = e.routes[0];
  const bounds = L.latLngBounds(route.coordinates);

  // FlyToBounds con durata in secondi
  map.flyToBounds(bounds, {
    padding: [50, 50],
    duration: 5  // durata in secondi
  });
});

    } catch (err) {
      alert("Errore nel calcolo percorso: " + err.message);
    }
  }

  function resetRoute() {
    if (control) { map.removeControl(control); control = null; }
    searchMarkers.forEach(m => map.removeLayer(m));
    searchMarkers = [];
    document.getElementById('start').value = '';
    document.getElementById('end').value = '';

    // Ripristina la vista iniziale
    map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 1 });
  }

  // --- Event listener ---
  document.getElementById('route-btn').addEventListener('click', async () => {
    const start = document.getElementById('start').value.trim();
    const end = document.getElementById('end').value.trim();
    await calculateRoute(start, end);
  });

  document.getElementById('clear-btn').addEventListener('click', resetRoute);

  // Vista iniziale
  map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 2 });
});
