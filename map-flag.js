document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [45, 10], zoom: 4 };
  const desktopView = { center: [49, 30], zoom: 4 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;
const southWest = L.latLng(-90, 190); // più a ovest di Nuku'alofa
const northEast = L.latLng(90, -190); // più a est di Tuvalu
const maxBounds = L.latLngBounds(southWest, northEast);
  
  // --- Layer base ---
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  noWrap: false,
  updateWhenZooming: true,   // aggiorna tiles anche durante zoom animati
  updateWhenIdle: false,     // non aspettare che la mappa sia ferma
  keepBuffer: 5              // numero di tiles extra da mantenere nel buffer
});

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { 
    attribution: 'Tiles &copy; Esri',
    noWrap: false,
    updateWhenZooming: true,
    updateWhenIdle: false,
    keepBuffer: 5
  }
);

// Mappa
const map = L.map('map', {
  center: initialView.center,
  zoom: initialView.zoom,
  layers: [satellite],
  zoomControl: true,
  minZoom: 3,
  maxZoom: 18,
  worldCopyJump: true,     // mappa si ripete orizzontalmente
  maxBounds: maxBounds,    // blocco soft confini
  maxBoundsViscosity: 1.0,
  wheelPxPerZoomLevel: 120,
  zoomSnap: 0.1
});

// --- Aggiorna altezza mappa su resize/orientation ---
function setVh() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--vh', vh + 'px');
  if (map) map.invalidateSize();
}

// iniziale
setVh();

// eventi
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);
if (window.visualViewport) window.visualViewport.addEventListener('resize', setVh);
  
  // --- Overlay etichette ---
  const labels = L.layerGroup();
  
  const capitalsData = [
{ name: "Abu Dhabi", nation: "United Arab Emirates", coords: [24.4539, 54.3773], flag: "🇦🇪" },
{ name: "Abuja", nation: "Nigeria", coords: [9.0579, 7.4951], flag: "🇳🇬" },
{ name: "Accra", nation: "Ghana", coords: [5.6037, -0.1870], flag: "🇬🇭" },
{ name: "Addis Ababa", nation: "Ethiopia", coords: [9.0300, 38.7400], flag: "🇪🇹" },
{ name: "Algiers", nation: "Algeria", coords: [36.7538, 3.0588], flag: "🇩🇿" },
{ name: "Amman", nation: "Jordan", coords: [31.9454, 35.9284], flag: "🇯🇴" },
{ name: "Amsterdam", nation: "Netherlands", coords: [52.3676, 4.9041], flag: "🇳🇱" },
{ name: "Andorra la Vella", nation: "Andorra", coords: [42.5078, 1.5211], flag: "🇦🇩" },
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
{ name: "Nouméa", nation: "New Caledonia (France)", coords: [-22.2700, 166.4400], flag: "🇳🇨" },
{ name: "Nukuʻalofa", nation: "Tonga", coords: [-21.1333, -175.2000], flag: "🇹🇴" },
{ name: "Nuuk", nation: "Greenland (Denmark)", coords: [64.1814, -51.6942], flag: "🇬🇱" },
{ name: "Oslo", nation: "Norway", coords: [59.9139, 10.7522], flag: "🇳🇴" },
{ name: "Ottawa", nation: "Canada", coords: [45.4215, -75.6972], flag: "🇨🇦" },
{ name: "Ouagadougou", nation: "Burkina Faso", coords: [12.3714, -1.5197], flag: "🇧🇫" },
{ name: "Pago Pago", nation: "American Samoa (US)", coords: [-14.2740, -170.7046], flag: "🇦🇸" },
{ name: "Palikir", nation: "Micronesia", coords: [6.9177, 158.1856], flag: "🇫🇲" },
{ name: "Panama City", nation: "Panama", coords: [8.9833, -79.5167], flag: "🇵🇦" },
{ name: "Papeete", nation: "French Polynesia (France)", coords: [-17.5333, -149.5667], flag: "🇵🇫" },
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
{ name: "San Juan", nation: "Puerto Rico (US)", coords: [18.4655, -66.1057], flag: "🇵🇷" },
{ name: "San Marino", nation: "San Marino", coords: [43.9336, 12.4508], flag: "🇸🇲" },
{ name: "San Salvador", nation: "El Salvador", coords: [13.6929, -89.2182], flag: "🇸🇻" },
{ name: "Sana'a", nation: "Yemen", coords: [15.3694, 44.1910], flag: "🇾🇪" },
{ name: "Santiago", nation: "Chile", coords: [-33.4489, -70.6693], flag: "🇨🇱" },
{ name: "Santo Domingo", nation: "Dominican Republic", coords: [18.4861, -69.9312], flag: "🇩🇴" },
{ name: "São Tomé", nation: "São Tomé and Príncipe", coords: [0.3365, 6.7273], flag: "🇸🇹" },
{ name: "Sarajevo", nation: "Bosnia and Herzegovina", coords: [43.8563, 18.4131], flag: "🇧🇦" },
{ name: "Seoul", nation: "South Korea", coords: [37.5665, 126.9780], flag: "🇰🇷" },
{ name: "Singapore", nation: "Singapore", coords: [1.3521, 103.8198], flag: "🇸🇬" },
{ name: "Skopje", nation: "North Macedonia", coords: [41.9981, 21.4254], flag: "🇲🇰" },
{ name: "Sofia", nation: "Bulgaria", coords: [42.6977, 23.3219], flag: "🇧🇬" },
{ name: "South Tarawa", nation: "Kiribati", coords: [1.3278, 172.9770], flag: "🇰🇮" },
{ name: "Stockholm", nation: "Sweden", coords: [59.3293, 18.0686], flag: "🇸🇪" },
{ name: "Suva", nation: "Fiji", coords: [-18.1416, 178.4419], flag: "🇫🇯" },
{ name: "Taipei", nation: "Taiwan", coords: [25.0330, 121.5654], flag: "🇹🇼" },
{ name: "Tallinn", nation: "Estonia", coords: [59.4370, 24.7536], flag: "🇪🇪" },
{ name: "Tarawa Atoll (South Tarawa)", nation: "Kiribati", coords: [1.3278, 172.9770], flag: "🇰🇮" },
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
{ name: "Washington, D.C.", nation: "United States", coords: [38.8951, -77.0364], flag: "🇺🇸" },
{ name: "Wellington", nation: "New Zealand", coords: [-41.2865, 174.7762], flag: "🇳🇿" },
{ name: "Windhoek", nation: "Namibia", coords: [-22.5597, 17.0832], flag: "🇳🇦" },
{ name: "Yamoussoukro", nation: "Ivory Coast", coords: [6.8276, -5.2893], flag: "🇨🇮" },
{ name: "Yaoundé", nation: "Cameroon", coords: [3.8480, 11.5021], flag: "🇨🇲" },
{ name: "Yerevan", nation: "Armenia", coords: [40.1792, 44.4991], flag: "🇦🇲" },
{ name: "Zagreb", nation: "Croatia", coords: [45.8150, 15.9819], flag: "🇭🇷" }
];

   capitalsData.forEach(({ name, coords }) => {
    const label = L.marker(coords, {
      icon: L.divIcon({
        className: 'capital-label',
        html: `<div class="capital-box">${name}</div>`,
        iconAnchor: [0, 0]
      })
    });

    label.on('click', () => {
      map.flyTo(coords, 15, { animate: true, duration: 5, easeLinearity: 0.25 });
    });

    labels.addLayer(label);
  });

  labels.addTo(map);

 // --- Aggiorna font/padding delle etichette in base allo zoom ---
function updateLabels() {
  const zoom = map.getZoom();

  // zoom "ancoraggi"
  const zMin = 3, zMid = 5, zMax = 14;

  // font corrispondenti
  const fontAt3 = 6;
  const fontAt5 = 12;
  const fontAt14 = 14;

  // padding corrispondenti
  const padAt3 = 2;
  const padAt5 = 4;
  const padAt14 = 6;

  let fontSize, padding;

  if (zoom <= zMid) {
    // da 3 → 5
    const f = (zoom - zMin) / (zMid - zMin);
    fontSize = fontAt3 + f * (fontAt5 - fontAt3);
    padding  = padAt3  + f * (padAt5 - padAt3);
  } else {
    // da 5 → 14
    const f = (zoom - zMid) / (zMax - zMid);
    fontSize = fontAt5 + f * (fontAt14 - fontAt5);
    padding  = padAt5  + f * (padAt14 - padAt5);
  }

  document.querySelectorAll('.capital-box').forEach(el => {
    el.style.fontSize = `${fontSize}px`;
    el.style.padding  = `${padding}px ${padding * 2}px`;
  });
}

// Aggiorna etichette durante lo zoom (anche animato)
map.on('zoom', updateLabels);

// Aggiornamento iniziale
updateLabels();

  // --- FlyTo iniziale ---
  map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 5, easeLinearity: 0.25 });

  // --- Layer switcher ---
  L.control.layers(
    { "Satellite": satellite, "OpenStreetMap": osm },
    { "Capitali": labels },
    { collapsed: true }
  ).addTo(map);

  // --- Box Home + Locate ---
  const controlBox = L.control({ position: 'topright' });
  controlBox.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'custom-home-box leaflet-bar');

    // Pulsante Home
    const homeBtn = L.DomUtil.create('a', 'custom-home-button', container);
    homeBtn.href = '#';
    homeBtn.innerHTML = '🏠';
    homeBtn.title = "Torna alla vista iniziale";
    L.DomEvent.on(homeBtn, 'click', e => {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      map.flyTo(initialView.center, initialView.zoom, {animate: true, duration: 8, easeLinearity: 0.25 });
    });

    // Pulsante Locate
    const locateControl = L.control.locate({
      flyTo: { duration: 2, easeLinearity: 0.25 },
      strings: { title: "Mostrami la mia posizione" },
      locateOptions: { enableHighAccuracy: true, watch: false }
    });
    const locateBtn = locateControl.onAdd(map);
    container.appendChild(locateBtn);

    return container;
  };
  controlBox.addTo(map);
});
