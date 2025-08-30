# Mappa 8‑bit Europa – GitHub Pages

## Cos’è questo progetto
Mappa interattiva dell’Europa in stile retro 8‑bit con:
- Popup al clic sulle città
- Zoom automatico
- Dati facilmente modificabili

## Come si usa
1. Carica tutti i file nella repo `Archeoisio.github.io`.
2. Attiva GitHub Pages (di solito in "main").
3. Visita `https://Archeoisio.github.io`.

## Modifiche ai dati
1. Vai su `data/locations.geojson`.
2. Clicca su **Modifica**.
3. Aggiungi, modifica o rimuovi Feature.
4. Salva: il sito si aggiorna automaticamente.

### Esempio di aggiunta:
```json
{
  "type": "Feature",
  "properties": { "name": "Lisbon", "type": "capital" },
  "geometry": { "type": "Point", "coordinates": [-9.1393, 38.7223] }
}

