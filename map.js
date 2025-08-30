document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [50, 10], zoom: 5 };
  const desktopView = { center: [49, 30], zoom: 5 };
  const isMobile    = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '&copy; Esri', noWrap: true }
  );
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors', noWrap: true }
  );
  const baseLayers = { 'Satellite': satellite, 'OpenStreetMap': osm };

  const capitali = L.layerGroup();
  [
    { name: 'Roma', coords:[41.9028,12.4964] },
    { name: 'Parigi', coords:[48.8566,2.3522] },
    { name: 'Londra', coords:[51.5074,-0.1278] }
  ].forEach(({name,coords}) => {
    const m = L.marker(coords).bindPopup(name).on('click',()=>{ map.setView(coords,10); m.openPopup(); });
    capitali.addLayer(m);
  });

  const map = L.map('map',{
    center: initialView.center,
    zoom: initialView.zoom,
    minZoom: 2,
    maxZoom: 20,
    zoomControl:false,
    scrollWheelZoom:{wheelPxPerZoomLevel:1000,wheelDebounceTime:80},
    zoomDelta:0.1,
    layers:[satellite,capitali],
    maxBounds:[[-90,-180],[90,180]],
    maxBoundsViscosity:1.0
  });

  L.control.layers(baseLayers,{ 'Capitali': capitali },{collapsed:true}).addTo(map);

  // Container custom allineato a destra
  const topRight = map._controlCorners.topright;
  const customContainer = L.DomUtil.create('div','custom-controls');
  topRight.appendChild(customContainer);

  // --- Primo slot vuoto ---
  const spacer = L.DomUtil.create('div','custom-spacer leaflet-control');
  customContainer.appendChild(spacer);

  // --- Pulsante Home ---
  const homeBtn = L.DomUtil.create('div','custom-home-button leaflet-control');
  homeBtn.title = "Torna Home";
  homeBtn.innerHTML = '<a>🏠</a>';
  homeBtn.onclick = ()=>{ map.setView(initialView.center, initialView.zoom); };
  customContainer.appendChild(homeBtn);

  // --- Pulsante Locate ---
  const locateBtn = L.DomUtil.create('div','custom-locate-button leaflet-control');
  locateBtn.title = "Localizza me";
  locateBtn.innerHTML = '<a>📍</a>';
  customContainer.appendChild(locateBtn);

  locateBtn.addEventListener('click', ()=>{
    map.locate({ setView:false, watch:false, maxZoom:18 });
  });

  map.on('locationfound', e=>{
    map.flyTo(e.latlng,18);

    // marker emoji
    L.marker(e.latlng,{
      icon: L.divIcon({
        html:'📍',
        className:'custom-locate-marker',
        iconSize:[30,30],
        iconAnchor:[15,30]
      })
    }).addTo(map);

    // piccolo pallino blu
    L.circle(e.latlng,{
      radius: 5, // metà dimensione
      color:'blue',
      fillColor:'blue',
      fillOpacity:0.5,
      weight:0
    }).addTo(map);
  });
});

