mapboxgl.accessToken = 'pk.eyJ1IjoiaXNpbyIsImEiOiJjbWY3bnljcjIwZmwwMmpzNnNrMmdzMWI0In0.HwYix6TI4UEGx3zh6Oq3HQ';

document.addEventListener('DOMContentLoaded', () => {
  const MOBILE_MAX_WIDTH = 767;
  const mobileView  = { center: [10, 55], zoom: 2 };
  const desktopView = { center: [40, 45], zoom: 2.5 };
  const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
  const initialView = isMobile ? mobileView : desktopView;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    projection: 'globe',
    center: initialView.center,
    zoom: initialView.zoom
  });

  map.on('style.load', () => {
    map.setFog({}); // effetto 3D globale
  });

  // Capitali
  const capitalsData = [
    { name: "Roma", coords: [12.4964, 41.9028] },
    { name: "Parigi", coords: [2.3522, 48.8566] },
    { name: "Londra", coords: [-0.1278, 51.5074] },
    { name: "Berlino", coords: [13.4050, 52.5200] },
    { name: "Madrid", coords: [-3.7038, 40.4168] }
    // aggiungi tutte le altre capitali se vuoi
  ];

  capitalsData.forEach(({name, coords}) => {
    const el = document.createElement('div');
    el.className = 'capital-box';
    el.textContent = name;

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(coords) // [lng, lat]
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(name))
      .addTo(map);

    el.addEventListener('click', () => {
      map.flyTo({ center: coords, zoom: 5, speed: 0.8 });
      marker.togglePopup();
    });
  });

  // Pulsante Home
  const homeBtn = document.querySelector('.custom-home-btn');
  homeBtn.addEventListener('click', () => {
    map.flyTo({ center: initialView.center, zoom: initialView.zoom, speed: 0.8 });
  });

  // Pulsante Geolocate
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showAccuracyCircle: true
  });
  map.addControl(geolocate, 'top-right');
});
