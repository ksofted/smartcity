import { useMapEvents } from 'react-leaflet';

// Drop this inside a MapContainer — calls onMapClick(lat, lng) on every click
export default function MapClickHandler({ active, onMapClick }) {
  useMapEvents({
    click(e) {
      if (!active) return;
      onMapClick(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}
