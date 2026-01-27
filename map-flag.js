document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAZIONI VIEWPORT & MAPPA ---
    const MOBILE_MAX_WIDTH = 1024;
    
    // Rileviamo se è mobile e se è in modalità orizzontale (larghezza > altezza)
    const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
    const isLandscape = window.innerWidth > window.innerHeight;

    let initialView;

    if (isMobile) {
        if (isLandscape) {
            // VISTA MOBILE RUOTATO (Orizzontale)
            // Usiamo uno zoom intermedio o lo stesso, ma puoi cambiare il centro per bilanciare i pannelli
            initialView = { center: [48, 25], zoom: 4 }; 
        } else {
            // VISTA MOBILE VERTICALE (Il tuo originale)
            initialView = { center: [50, 22], zoom: 4 };
        }
    } else {
        // VISTA DESKTOP (Il tuo originale)
        initialView = { center: [44, 30], zoom: 5 };
    }
    
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
    const bordersUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson';
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
    { name: "Uppsala", type: "home", nation: "Svezia", coords: [59.862514043172986, 17.65992409050815], info: "Frodegatan 33E", date: "Settembre 2022/Gennaio 2023", flag: "🇸🇪" },
    { name: "Stoccolma", type: "viaggi", nation: "Svezia", coords: [59.3294951830058, 18.068096560204545], info: "", date: "2022", flag: "🇸🇪" },
    { name: "Venezia", type: "viaggi", nation: "Italia", coords: [59.3294951830058, 18.068096560204545], info: "Carnevale", date: "Febbraio 2023", flag: "🇮🇹" }, 
    { name: "Helsinki", type: "viaggi", nation: "Finlandia", coords: [60.168953224843925, 24.94689033493932], info: "Crociera, Neve, Capodanno", date: "Dicembre 2022/Gennaio 2023", flag: "🇫🇮" },
    { name: "Dubrovnik", type: "viaggi", nation: "Croazia", coords: [42.6537607716032, 18.07592177449959], info: "Estate", date: "Agosto 2023", flag: "🇭🇷" },
    { name: "Ecce Homo", type: "home", nation: "Italia", coords: [40.84505106749316, 14.253687972830459], info: "FDB", date: "", flag: "🇮🇹" },
    { name: "Laspro", type: "home", nation: "Italia", coords: [40.685508164571274, 14.767897013099008], info: "MM", date: "", flag: "🇮🇹" },
    { name: "Fratte", type: "home", nation: "Italia", coords: [40.69672994658257, 14.77710915495002], info: "Via Francesco Spirito 51", date: "Settembre 2021/Novembre 2023", flag: "🇮🇹" },
    { name: "Dipylou 8A", type: "home", nation: "Grecia", coords: [37.979367399856606, 23.72075051641102], info: "Atene, Monastiraki/Ceramico", date: "Settembre 2017/Aprile 2018", flag: "🇬🇷" },
    { name: "Rethymno", type: "home", nation: "Grecia", coords: [35.36987174693328, 24.473314364073172], info: "Αραμπατζόγλου, Creta", date: "Aprile/Giugno 2018", flag: "🇬🇷" },
    { name: "Balos", type: "mare", nation: "Grecia", coords: [35.580276911058206, 23.590131576784163], info: "💩", date: "Agosto 2017", flag: "🇬🇷" },
    { name: "Rovereto", type: "viaggi", nation: "Italia", coords: [45.89395899156252, 11.044717689909284], info: "Rassegna del Cinema Archeologico,<br> da Walter", date: "Ottobre 2016", flag: "🇮🇹" },
    { name: "Piana del Lago", type: "viaggi", nation: "Italia", coords: [40.47193226964949, 15.762858874330147], info: "Basilicata", date: "Ferragosto 2021", flag: "🇮🇹" },
    { name: "Baden-Baden", type: "viaggi", nation: "Germania", coords: [48.76311189146083, 8.242163002948708], info: "Terme tutti infagottati", date: "Novembre 2023", flag: "🇩🇪" },
    { name: "Copenaghen", type: "viaggi", nation: "Danimarca", coords: [55.672371078279056, 12.562182923586093], info: "KebabCompleanno", date: "Agosto/Settembre 2022", flag: "🇩🇰" },
     
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
    
    // --- 4. CARICAMENTO CONFINI (GEOJSON) ---
fetch(bordersUrl)
    .then(r => r.json())
    .then(data => {
        const geoJsonLayer = L.geoJSON(data, {
            style: { color: '#4a90e2', weight: 1, fillOpacity: 0 },
            onEachFeature: (feature, layer) => {
                layer.on('click', (e) => {
                    L.DomEvent.stopPropagation(e);

                    // --- LOGICA TOGGLE ---
                    if (selectedLayer === layer) {
                        // Se clicco la nazione già attiva, la deseleziono
                        geoJsonLayer.resetStyle(layer);
                        selectedLayer = null;
                        document.getElementById('info-panel').style.display = 'none';
                        return; // Esco subito dalla funzione
                    }

                    // Se clicco una nazione diversa, resetto quella precedente
                    if (selectedLayer) {
                        geoJsonLayer.resetStyle(selectedLayer);
                    }

                    // Attivo la nuova nazione
                    layer.setStyle({ color: '#ff0000', weight: 2, fillOpacity: 0 });
                    layer.bringToFront();
                    selectedLayer = layer;

                    // --- Aggiornamento Pannello Info ---
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
    "home": "🏠",
    "mare": "🏖️",
    "viaggi": "✈️"
};

specialPlaces.forEach(place => {
    // Recuperiamo l'emoji corretta in base al tipo (se non trova il tipo, usa il cuore come backup)
    const categoryIcon = typeIcons[place.type] || "❤️";

  const customIcon = L.divIcon({
        className: 'marker-container', // Classe neutra
        html: `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                width: 32px; 
                height: 32px; 
                background-color: white; 
                border: 2px solid #fff; 
                border-radius: 50%; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                font-size: 20px;
            ">
                ${categoryIcon}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [18, 18] // Centra il cerchio sulle coordinate
    });

    const marker = L.marker(place.coords, { icon: customIcon }).addTo(heartsLayer);

    // Pop-up personalizzato
marker.bindPopup(`
    <div style="text-align:center; min-width: 80px; font-family: sans-serif;">
        <span style="font-size: 16px;">${categoryIcon}</span><br>
        <b style="font-size: 14px; color: #333;">${place.name}</b><br>
        <div style="font-size: 12px; color: #555; margin: 4px 0;">${place.info}</div>
       ${place.date ? `
            <div style="font-size: 12px; color: #4a90e2; font-weight: bold; border-top: 1px solid #eee; padding-top: 5px; margin-top: 5px;">
                🗓️ ${place.date}
            </div>
        ` : ''}
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
async function startRouting() {
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');

    if (!startInput || !endInput) return;

    const startVal = startInput.value;
    const endVal = endInput.value;

    if (!startVal || !endVal) {
        alert("Inserisci sia partenza che destinazione");
        return;
    }

    try {
        // Funzione Geocoding interna
        const geocode = async (query) => {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const d = await r.json();
            if (d.length === 0) throw new Error();
            return L.latLng(d[0].lat, d[0].lon);
        };

        const startCoords = await geocode(startVal);
        const endCoords = await geocode(endVal);

        if (control) map.removeControl(control);

        control = L.Routing.control({
            waypoints: [startCoords, endCoords],
            language: 'it',
            routeWhileDragging: true,
            lineOptions: { styles: [{ color: '#4a90e2', weight: 5 }] }
        }).addTo(map);


    } catch (e) {
        alert("Località non trovata. Prova a essere più specifico.");
    }
}
// --- 7. CONTROLLI INTERFACCIA ---

// 1. Switcher Layer Base (Spostato a destra)
const layersControl = L.control.layers(
    {"Satellite": satellite, "OSM": osm}, 
    {"Nazioni": bordersLayer, "Capitali": capitalsLayer, "❤️": heartsLayer }
).addTo(map);

const layersContainer = layersControl.getContainer();
layersContainer.style.marginRight = '2px'; 

// --- CONTROLLO 1: PULSANTI (IN ALTO A DESTRA) ---
const btnControl = L.control({ position: 'topright' });
btnControl.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'leaflet-bar');
    
    // Stile per posizionamento
     
  container.style.marginTop = '4px';
    container.style.marginRight = '4px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '5px';
    container.style.background = 'transparent';
    container.style.border = 'none';

    // --- PUNTO DI INSERIMENTO: BLOCCO INTERAZIONE MAPPA ---
    // Questo impedisce che il click o il tocco passino alla mappa sottostante
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
    L.DomEvent.on(container, 'touchstart', L.DomEvent.stopPropagation);
    L.DomEvent.on(container, 'pointerdown', L.DomEvent.stopPropagation);

    // Funzione helper per creare bottoni uniformi
    const createBtn = (html, title, onClick) => {
        const btn = L.DomUtil.create('a', 'custom-home-button', container);
        btn.innerHTML = html;
        btn.title = title;
        btn.href = '#';
        L.DomEvent.on(btn, 'click', e => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            onClick();
        });
        return btn;
    };

    // Pulsante Home 🌍
    createBtn('🌍', "Torna alla vista iniziale", () => {
        map.flyTo(initialView.center, initialView.zoom, { animate: true, duration: 2 });
    });

    // Pulsante Locate 📍
    const locateControl = L.control.locate({
        flyTo: { duration: 2 },
        strings: { title: "Posizione" }
    });
    container.appendChild(locateControl.onAdd(map));
    
    // Pulsante Routing 🗺️
    createBtn('🗺️', "Mostra/Nascondi indicazioni", () => {
        const rb = document.getElementById('route-box');
        const hb = document.getElementById('hearts-list-box');
        if(hb) hb.style.display = 'none'; 
        if(rb) rb.style.display = (rb.style.display === 'none') ? 'flex' : 'none';
    });

    // Pulsante Cuore ❤️
    createBtn('❤️', "Luoghi del cuore", () => {
        const rb = document.getElementById('route-box');
        const hb = document.getElementById('hearts-list-box');
        if(rb) rb.style.display = 'none'; 
        if(hb) hb.style.display = (hb.style.display === 'none') ? 'flex' : 'none';
    });

    return container;
};
btnControl.addTo(map);

// --- CONTROLLO 2: PANNELLI INFORMATIVI (BASSO SINISTRA) ---
const sideInfoControl = L.control({ position: 'bottomleft' });
sideInfoControl.onAdd = function(map) {
    const container = L.DomUtil.create('div', 'info-container-bottom');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start';
    container.style.marginBottom = '12px'; 
    container.style.marginLeft = '10px';   
    container.style.pointerEvents = 'auto';

    // 1. Box Routing
    const routeBox = L.DomUtil.create('div', '', container);
    routeBox.id = 'route-box';
    routeBox.style.display = 'none';
    routeBox.style.flexDirection = 'column';
    routeBox.style.background = 'rgba(0,0,0,0.5)';
    routeBox.style.color = 'white';
    routeBox.style.padding = '10px';
    routeBox.style.borderRadius = '8px';
    routeBox.style.width = '180px';
    routeBox.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    
    routeBox.innerHTML = `
        <input id="start" placeholder="Partenza" style="width:100%; margin-bottom:5px; padding:4px;">
        <input id="end" placeholder="Destinazione" style="width:100%; margin-bottom:8px; padding:4px;">
        <div style="display:flex; gap:5px;">
            <button id="route-btn" style="flex:1; cursor:pointer; padding:5px; border-radius:4px; border:none; background:white; font-weight:bold;">Calcola</button>
            <button id="clear-btn" style="flex:1; cursor:pointer; padding:5px; border-radius:4px; border:none; background:#ff5252; color:white;">Reset</button>
        </div>
    `;

   // Colleghiamo i tasti usando il sistema di eventi di Leaflet
    setTimeout(() => {
        const rb = document.getElementById('route-btn');
        const cb = document.getElementById('clear-btn');

        if (rb) {
            L.DomEvent.on(rb, 'click', async (e) => {
                L.DomEvent.stopPropagation(e);
                await startRouting();
            });
        }

        if (cb) {
            L.DomEvent.on(cb, 'click', (e) => {
                L.DomEvent.stopPropagation(e);
                if (control) {
                    map.removeControl(control);
                    control = null;
                }
                document.getElementById('start').value = '';
                document.getElementById('end').value = '';
            });
        }
    }, 100);

    // 2. Box Lista Cuori
    const heartsListBox = L.DomUtil.create('div', '', container);
    heartsListBox.id = 'hearts-list-box';
    heartsListBox.style.display = 'none';
    heartsListBox.style.marginTop = '10px';
    heartsListBox.style.background = 'rgba(0,0,0,0.5)';
    heartsListBox.style.padding = '10px';
    heartsListBox.style.borderRadius = '8px';
    heartsListBox.style.width = '200px';
    heartsListBox.style.maxHeight = '350px';
    heartsListBox.style.overflowY = 'auto';
    
// Impedisce che lo scroll del mouse o il trascinamento touch muovano la mappa sotto
L.DomEvent.disableScrollPropagation(heartsListBox);
L.DomEvent.disableClickPropagation(heartsListBox);

// Blocco specifico per il touch (Mobile) e trascinamento (Desktop)
L.DomEvent.on(heartsListBox, 'mousedown mousewheel touchstart pointerdown', (e) => {
    L.DomEvent.stopPropagation(e);
    map.dragging.disable();
    map.scrollWheelZoom.disable();
});

// Riattiva tutto quando usciamo dal riquadro
L.DomEvent.on(heartsListBox, 'mouseleave touchend', () => {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
});
    ["home", "mare", "viaggi"].forEach(category => {
        const placesInCategory = specialPlaces.filter(p => p.type === category);
        if (placesInCategory.length > 0) {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '8px';
            wrapper.innerHTML = `
                <div class="header" style="cursor:pointer; display:flex; justify-content:space-between; padding:5px; background:rgba(255,255,255,0.1); border-radius:4px;">
                    <span style="color:#ffeb3b; font-size:12px; font-weight:bold;">${typeIcons[category]} ${category.toUpperCase()}</span>
                    <span class="arrow" style="color:white;">►</span>
                </div>
                <div class="content" style="display:none; padding:5px 0 0 10px;"></div>
            `;
            const header = wrapper.querySelector('.header');
            const content = wrapper.querySelector('.content');

            placesInCategory.forEach(p => {
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.marginBottom = '5px';
                item.style.alignItems = 'center';
                item.innerHTML = `<span style="font-size:12px; font-weight:bold; color:white;">${p.flag} ${p.name}</span>`;
                
                const vBtn = document.createElement('button');
                vBtn.innerText = 'Vola';
                vBtn.style.fontWeight = 'bold';
                vBtn.style.fontSize = '12px';
                vBtn.style.padding = '2px 5px';
                vBtn.onclick = () => map.flyTo(p.coords, 16);
                
                item.appendChild(vBtn);
                content.appendChild(item);
            });

            header.onclick = () => {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                wrapper.querySelector('.arrow').innerHTML = isHidden ? '▼' : '►';
            };
            heartsListBox.appendChild(wrapper);
        }
    });

    return container;
};
sideInfoControl.addTo(map);

function setVh() {
    const mapEl = document.getElementById('map');
    if (!mapEl || !map) return;

    const runResize = () => {
        // Reset asimmetria Chrome
        mapEl.style.left = "0px";
        mapEl.style.top = "0px";
        
        // Pixel reali del viewport
        mapEl.style.width = window.innerWidth + 'px';
        mapEl.style.height = window.innerHeight + 'px';
        
        map.invalidateSize({ animate: false });
    };

    runResize();
    // Eseguiamo più volte perché Chrome aggiorna il viewport con ritardo
    setTimeout(runResize, 100);
    setTimeout(runResize, 500);
}
    
// Chiusura del DOMContentLoaded
});
