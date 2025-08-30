const map = L.map('map').setView([54, 15], 4);

L.tileLayer('tiles/{z}/{x}/{y}.png', { maxZoom: 6, attribution: '' }).addTo(map);

const myIcon = L.icon({
  iconUrl: 'tiles/marker.png',
  iconSize: [16, 16],
  iconAnchor: [8, 16],
  popupAnchor: [0, -16],
});

fetch('data/locations.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.marker(latlng, { icon: myIcon }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>${feature.properties.name}</b>`, { autoPan: true });
        layer.on('click', (e) => {
          layer.openPopup();
          map.flyTo(e.latlng, 7);
        });
      },
    }).addTo(map);
  });

