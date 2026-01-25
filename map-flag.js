document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAZIONI VIEWPORT & MAPPA ---
    const MOBILE_MAX_WIDTH = 767;
    const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
    const initialView = isMobile ? { center: [50, 22], zoom: 4 } : { center: [44, 30], zoom: 5 };
    
    const map = L.map('map', {
        center: initialView.center,
        zoom: initialView.zoom,
        zoomControl: true,
        minZoom: 2.5,
        worldCopyJump: true,
        maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(75, 193)),
        maxBoundsViscosity: 1.0,
        attributionControl: false
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    const capitalsLayer = L.layerGroup().addTo(map);
    
    // --- 2. DEFINIZIONE LAYER E VARIABILI DI STATO ---
    const labels = L.layerGroup();
    const heartsLayer = L.layerGroup().addTo(map);
    const bordersLayer = L.layerGroup().addTo(map);
    let selectedLayer = null;
    let control = null; // Per il routing
    let searchMarkers = [];

    // --- 3. DATI ---
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
{ name: "Bangui", nation: "Central African Rep.", coords: [4.3947, 18.5582], flag: "🇨🇫" },
{ name: "Banjul", nation: "Gambia", coords: [13.4549, -16.5790], flag: "🇬🇲" },
{ name: "Basseterre", nation: "St. Kitts and Nevis", coords: [17.3026, -62.7177], flag: "🇰🇳" },
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
{ name: "Brazzaville", nation: "Congo", coords: [-4.2634, 15.2429], flag: "🇨🇬" },
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
{ name: "Honiara", nation: "Solomon Is.", coords: [-9.4456, 159.9729], flag: "🇸🇧" },
{ name: "Islamabad", nation: "Pakistan", coords: [33.6844, 73.0479], flag: "🇵🇰" },
{ name: "Jakarta", nation: "Indonesia", coords: [-6.2088, 106.8456], flag: "🇮🇩" },
{ name: "Kabul", nation: "Afghanistan", coords: [34.5553, 69.2075], flag: "🇦🇫" },
{ name: "Kampala", nation: "Uganda", coords: [0.3476, 32.5825], flag: "🇺🇬" },
{ name: "Kathmandu", nation: "Nepal", coords: [27.7172, 85.3240], flag: "🇳🇵" },
{ name: "Khartoum", nation: "Sudan", coords: [15.5007, 32.5599], flag: "🇸🇩" },
{ name: "Kigali", nation: "Rwanda", coords: [-1.9706, 30.1044], flag: "🇷🇼" },
{ name: "Kingston", nation: "Jamaica", coords: [17.9712, -76.7936], flag: "🇯🇲" },
{ name: "Kingstown", nation: "St. Vin. and Gren.", coords: [13.1600, -61.2248], flag: "🇻🇨" },
{ name: "Kinshasa", nation: "Dem. Rep. Congo", coords: [-4.4419, 15.2663], flag: "🇨🇩" },
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
{ name: "Majuro", nation: "Marshall Is.", coords: [7.1167, 171.3667], flag: "🇲🇭" },
{ name: "Malabo", nation: "Eq. Guinea", coords: [3.7523, 8.7741], flag: "🇬🇶" },
{ name: "Malé", nation: "Maldives", coords: [4.1755, 73.5093], flag: "🇲🇻" },
{ name: "Managua", nation: "Nicaragua", coords: [12.1364, -86.2514], flag: "🇳🇮" },
{ name: "Manama", nation: "Bahrain", coords: [26.2154, 50.5832], flag: "🇧🇭" },
{ name: "Manila", nation: "Philippines", coords: [14.5995, 120.9842], flag: "🇵🇭" },
{ name: "Maputo", nation: "Mozambique", coords: [-25.9667, 32.5833], flag: "🇲🇿" },
{ name: "Maseru", nation: "Lesotho", coords: [-29.3167, 27.4833], flag: "🇱🇸" },
{ name: "Mbabane", nation: "eSwatini", coords: [-26.3167, 31.1333], flag: "🇸🇿" },
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
{ name: "Prague", nation: "Czechia", coords: [50.0755, 14.4378], flag: "🇨🇿" },
{ name: "Praia", nation: "Cabo Verde", coords: [14.9167, -23.5167], flag: "🇨🇻" },
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
{ name: "Santo Domingo", nation: "Dominican Rep.", coords: [18.4861, -69.9312], flag: "🇩🇴" },
{ name: "São Tomé", nation: "São Tomé and Principe", coords: [0.3365, 6.7273], flag: "🇸🇹" },
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
{ name: "Vatican City", nation: "Vatican", coords: [41.9029, 12.4534], flag: "🇻🇦" },
{ name: "Victoria", nation: "Seychelles", coords: [-4.6191, 55.4513], flag: "🇸🇨" },
{ name: "Vienna", nation: "Austria", coords: [48.2082, 16.3738], flag: "🇦🇹" },
{ name: "Vientiane", nation: "Laos", coords: [17.9757, 102.6331], flag: "🇱🇦" },
{ name: "Vilnius", nation: "Lithuania", coords: [54.6872, 25.2797], flag: "🇱🇹" },
{ name: "Warsaw", nation: "Poland", coords: [52.2297, 21.0122], flag: "🇵🇱" },
{ name: "Washington D.C.", nation: "United States of America", coords: [38.8951, -77.0364], flag: "🇺🇸" },
{ name: "Wellington", nation: "New Zealand", coords: [-41.2865, 174.7762], flag: "🇳🇿" },
{ name: "Windhoek", nation: "Namibia", coords: [-22.5597, 17.0832], flag: "🇳🇦" },
{ name: "Yamoussoukro", nation: "Côte d'Ivoire", coords: [6.8276, -5.2893], flag: "🇨🇮" },
{ name: "Yaoundé", nation: "Cameroon", coords: [3.8480, 11.5021], flag: "🇨🇲" },
{ name: "Yerevan", nation: "Armenia", coords: [40.1792, 44.4991], flag: "🇦🇲" },
{ name: "Zagreb", nation: "Croatia", coords: [45.8150, 15.9819], flag: "🇭🇷" },
{ name: "Saint John's", nation: "Antigua and Barb.", coords: [17.1274, -61.8468], flag: "🇦🇬" },
{ name: "St. George's", nation: "Grenada", coords: [12.0561, -61.7486], flag: "🇬🇩" },
{ name: "Guatemala City", nation: "Guatemala", coords: [14.6349, -90.5069], flag: "🇬🇹" },
{ name: "Conakry", nation: "Guinea", coords: [9.5092, -13.7122], flag: "🇬🇳" },
{ name: "Kuala Lumpur", nation: "Malaysia", coords: [3.1390, 101.6869], flag: "🇲🇾" },
{ name: "Juba", nation: "S. Sudan", coords: [4.8517, 31.5825], flag: "🇸🇸" },
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
 const specialPlaces = [
    { name: "Uppsala", type: "case", nation: "Svezia", coords: [59.862514043172986, 17.65992409050815], info: "Frodegatan 33E Settembre 2022/Gennaio 2023", flag: "🇸🇪" },
    { name: "Atene", type: "case", nation: "Grecia", coords: [37.9838, 23.7275], info: "Culla della civiltà.", flag: "🇬🇷" },
    { name: "Portofino", type: "mare", nation: "Italia", coords: [44.3039, 9.2091], info: "Borgo ligure.", flag: "🇮🇹" },
    { name: "Baita Mia", type: "città", nation: "Italia", coords: [46.5, 11.5], info: "Casa in montagna.", flag: "🏠" }
];
    
capitalsData.forEach(cap => {
    const capIcon = L.divIcon({
        className: 'capital-marker',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none; transform: translate(-50%, -50%);">
                <div style="width: 6px; height: 6px; background: white; border: 1px solid #000; border-radius: 50%;"></div>
                <div style="color: white; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 2px black; margin-top: 1px; white-space: nowrap;">
                    ${cap.name}
                </div>
            </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
    });

    // CREAZIONE DEL MARKER (Mancava questa parte)
    const marker = L.marker(cap.coords, { 
        icon: capIcon,
        interactive: false 
    });
    
    capitalsLayer.addLayer(marker);
});
    // --- 4. CARICAMENTO CONFINI (GEOJSON) + POP-UP ---
  const bordersUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';

fetch(bordersUrl)
    .then(r => r.json())
    .then(data => {
        const geoJsonLayer = L.geoJSON(data, {
            style: { 
                color: '#4a90e2', 
                weight: 1, 
                fillOpacity: 0 
            },
            onEachFeature: (feature, layer) => {
                layer.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);

                    if (selectedLayer) {
                        geoJsonLayer.resetStyle(selectedLayer);
                    }

                    layer.setStyle({ 
                        color: '#ff0000', 
                        weight: 3, 
                        fillOpacity: 0 
                    });

                    layer.bringToFront();
                    selectedLayer = layer;

                    const nationName = feature.properties.NAME;
                    const myData = capitalsData.find(c => c.nation === nationName);
                    const panel = document.getElementById('info-panel');
                    const content = document.getElementById('info-content');

                    if (panel && content) {
                        const flag = myData ? myData.flag : "🏳️";
                        const capitalName = myData ? myData.name : "Non in elenco";

                        content.innerHTML = `
                            <div style="font-size:16px; font-weight:bold; color:white;">${nationName} ${flag}</div>
                            <div style="font-size:14px; margin-top:5px; color:white;">Capitale: <b style="color:#ffeb3b;">${capitalName}</b></div>
                            <button id="fly-to-cap" style="width:100%; margin-top:10px; cursor:pointer; background:white; color:black; border:none; padding:8px; border-radius:4px; font-weight:bold;">
                                ✈️ Vola sulla Capitale
                            </button>
                        `;
                        panel.style.display = 'block';

                        document.getElementById('fly-to-cap').onclick = () => {
                            if (myData && myData.coords) {
                                map.flyTo(myData.coords, 14, { animate: true, duration: 3 });
                            } else {
                                map.flyTo(e.latlng, 8, { animate: true, duration: 3 });
                            }
                        };
                    }
                });
            }
        }).addTo(bordersLayer);
    });

  // --- 5. CUORI ❤️ (Marker dinamici per tipologia) ---

// Definiamo le icone per i marker (le stesse usate nella lista)
const typeIcons = {
    "case": "🏠",
    "mare": "🏖️",
    "città": "🏙️"
};

specialPlaces.forEach(place => {
    // Recuperiamo l'emoji corretta in base al tipo (se non trova il tipo, usa il cuore come backup)
    const categoryIcon = typeIcons[place.type] || "❤️";

    const customIcon = L.divIcon({
        className: 'custom-heart-icon',
        html: `<div class="heart-emoji" style="font-size: 24px;">${categoryIcon}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker(place.coords, { 
        icon: customIcon, 
        zIndexOffset: 3000 
    });

    // Pop-up personalizzato con emoji e info
    marker.bindPopup(`
        <div style="text-align:center;">
            <span style="font-size: 20px;">${categoryIcon}</span><br>
            <b>${place.name}</b><br>
            <i style="font-size: 12px; color: #666;">${place.info}</i>
        </div>
    `);

    heartsLayer.addLayer(marker);
});

    // --- 6. GESTIONE CLICK MAPPA (DESELEZIONE) ---
    map.on('click', () => {
        const panel = document.getElementById('info-panel');
        if (panel) panel.style.display = 'none';
        if (selectedLayer) {
            bordersLayer.eachLayer(l => { if (l.resetStyle) l.resetStyle(selectedLayer); });
            selectedLayer = null;
        }
    });

    // --- 7. CONTROLLI INTERFACCIA (TOP-RIGHT) ---

      // Switcher Layer Base
    L.control.layers({"Satellite": satellite, "OSM": osm}, {"Nazioni": bordersLayer, "Capitali": capitalsLayer,"❤️": heartsLayer }).addTo(map); 
    
  // --- Controlli Home, Locate, Routing e Cuori a due colonne ---
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

    // --- Colonna sinistra: Box (Routing e Cuori) ---
    const leftCol = L.DomUtil.create('div', '', container);
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.alignItems = 'flex-end';

    // 1. Box Routing
    const routeBox = L.DomUtil.create('div', '', leftCol);
    routeBox.id = 'route-box';
    routeBox.style.marginTop = '10px';
    routeBox.style.width = '150px';
    routeBox.style.display = 'none';
    routeBox.style.flexDirection = 'column';
    routeBox.style.background = 'rgba(0, 0, 0, 0.7)'; // Sfondo scuro per leggibilità
    routeBox.style.color = 'white';
    routeBox.style.padding = '8px';
    routeBox.style.borderRadius = '5px';
    routeBox.style.boxSizing = 'border-box';

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
    buttonRow.style.gap = '4px';

    const calcBtn = document.createElement('button');
    calcBtn.id = 'route-btn';
    calcBtn.innerText = 'Calcola';
    calcBtn.style.flex = '1';
    calcBtn.style.borderRadius = '8px';
    buttonRow.appendChild(calcBtn);

    const clearBtn = document.createElement('button');
    clearBtn.id = 'clear-btn';
    clearBtn.innerText = 'Reset';
    clearBtn.style.flex = '1';
    clearBtn.style.borderRadius = '8px';
    buttonRow.appendChild(clearBtn);

    routeBox.appendChild(buttonRow);

    // 2. Box Lista Cuori (Versione Accordion)
const heartsListBox = L.DomUtil.create('div', '', leftCol);
heartsListBox.id = 'hearts-list-box';
heartsListBox.style.display = 'none';
heartsListBox.style.marginTop = '10px';
heartsListBox.style.background = 'rgba(0,0,0,0.85)';
heartsListBox.style.padding = '8px';
heartsListBox.style.borderRadius = '5px';
heartsListBox.style.width = '190px';
heartsListBox.style.maxHeight = '400px';
heartsListBox.style.overflowY = 'auto';

["case", "mare", "città"].forEach(category => {
    const placesInCategory = specialPlaces.filter(p => p.type === category);
    
    if (placesInCategory.length > 0) {
        // --- CONTENITORE CATEGORIA ---
        const categoryWrapper = document.createElement('div');
        categoryWrapper.style.marginBottom = '5px';

        // --- INTESTAZIONE (Il pulsante che espande/riduce) ---
        const header = document.createElement('div');
        header.style.cursor = 'pointer';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.padding = '5px';
        header.style.background = 'rgba(255,255,255,0.1)';
        header.style.borderRadius = '3px';
        header.innerHTML = `
            <span style="color: #ffeb3b; font-size: 13px; font-weight: bold;">
                ${typeIcons[category]} ${category.toUpperCase()}
            </span>
            <span class="arrow" style="color: white; font-size: 10px;">►</span>
        `;

        // --- CONTENITORE LUOGHI (Inizialmente nascosto) ---
        const listContent = document.createElement('div');
        listContent.style.display = 'none'; // Nasconde i luoghi all'inizio
        listContent.style.padding = '5px 0 5px 10px';

        // Aggiungiamo i luoghi alla lista
        placesInCategory.forEach(p => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.marginBottom = '4px';
            row.innerHTML = `<span style="font-size: 12px; color: white;">${p.flag} ${p.name}</span>`;

            const flyBtn = document.createElement('button');
            flyBtn.innerText = 'Vola';
            flyBtn.style.fontSize = '10px';
            flyBtn.style.cursor = 'pointer';
            flyBtn.onclick = (e) => {
                e.stopPropagation(); // Evita di chiudere il menu cliccando il bottone
                map.flyTo(p.coords, 14, {animate: true, duration: 5});
            };
            
            row.appendChild(flyBtn);
            listContent.appendChild(row);
        });

        // --- LOGICA CLICK (ESPANDI/RIDUCI) ---
        header.onclick = () => {
            const isHidden = listContent.style.display === 'none';
            
            // Opzionale: chiudi tutte le altre categorie prima di aprire questa
            // heartsListBox.querySelectorAll('.category-content').forEach(el => el.style.display = 'none');
            
            listContent.style.display = isHidden ? 'block' : 'none';
            header.querySelector('.arrow').innerHTML = isHidden ? '▼' : '►';
        };

        // Assegna una classe per l'eventuale chiusura automatica
        listContent.className = 'category-content';

        categoryWrapper.appendChild(header);
        categoryWrapper.appendChild(listContent);
        heartsListBox.appendChild(categoryWrapper);
    }
});

    // --- Colonna destra: Pulsanti verticali ---
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
    
    // Routing button (Mappa)
    const routeBtn = L.DomUtil.create('a', 'custom-home-button', btnCol);
    routeBtn.href = '#';
    routeBtn.innerHTML = '🗺️';
    routeBtn.title = "Mostra/Nascondi indicazioni";
    L.DomEvent.on(routeBtn, 'click', e => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        heartsListBox.style.display = 'none'; // Chiude i cuori se apri routing
        routeBox.style.display = (routeBox.style.display === 'none') ? 'flex' : 'none';
    });

    // Pulsante Cuore ❤️
    const heartBtn = L.DomUtil.create('a', 'custom-home-button', btnCol);
    heartBtn.href = '#';
    heartBtn.innerHTML = '❤️';
    heartBtn.title = "Luoghi del cuore";
    L.DomEvent.on(heartBtn, 'click', e => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        routeBox.style.display = 'none'; // Chiude routing se apri i cuori
        heartsListBox.style.display = (heartsListBox.style.display === 'none') ? 'flex' : 'none';
    });

    return container;
};
controlBox.addTo(map);

    // --- 8. LOGICA ROUTING (Geocoding + Routing Control) ---
    async function geocode(query) {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.length === 0) throw new Error("Non trovato");
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }

    async function startRouting() {
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        if(!start || !end) return;
        try {
            const s = await geocode(start);
            const e = await geocode(end);
            if (control) map.removeControl(control);
            control = L.Routing.control({
                waypoints: [L.latLng(s[0], s[1]), L.latLng(e[0], e[1])],
                show: true
            }).addTo(map);

            // --- SPOSTAMENTO SOTTO I BOTTONI ---
      const routingContainer = control.getContainer();
      const parent = routingContainer.parentNode;
      if (parent) {
          // AppendChild lo sposta fisicamente dopo il tuo controlBox
          parent.appendChild(routingContainer);
      }
        
        } catch(err) { alert("Località non trovata"); }
    }

// --- 9. EVENT LISTENERS E UTILITY ---

// Listener per il tasto Calcola
const routeBtnAction = document.getElementById('route-btn');
if (routeBtnAction) {
    routeBtnAction.addEventListener('click', async () => {
        const start = document.getElementById('start').value.trim();
        const end = document.getElementById('end').value.trim();
        // Nota: Assicurati che la funzione si chiami calculateRoute o startRouting come definita sopra
        if (typeof calculateRoute === "function") {
            await calculateRoute(start, end);
        } else {
            await startRouting();
        }
    });
}

// Listener per il tasto Reset
const clearBtnAction = document.getElementById('clear-btn');
if (clearBtnAction) {
    clearBtnAction.addEventListener('click', () => {
        if (typeof resetRoute === "function") {
            resetRoute();
        } else {
            // Fallback manuale se resetRoute non è definita
            if (control) map.removeControl(control);
            document.getElementById('start').value = '';
            document.getElementById('end').value = '';
        }
    });
} // <--- CHIUSURA CORRETTA DEL LISTENER RESET

// Funzione Altezza Viewport
function setVh() {
    const mapEl = document.getElementById('map');
    if (mapEl) {
        mapEl.style.height = `${window.innerHeight}px`;
        map.invalidateSize();
    }
}

window.addEventListener('resize', setVh);
setVh();

});
