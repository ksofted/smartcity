import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function rectPoints(a, b) {
  return [
    [a.lat, a.lng],
    [a.lat, b.lng],
    [b.lat, b.lng],
    [b.lat, a.lng],
  ];
}

// Reverse geocode center point using Nominatim
async function reversGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data || data.error) return '';

    const a = data.address || {};
    // Build a meaningful short name from address parts
    const name =
      a.amenity ||
      a.building ||
      a.leisure ||
      a.tourism ||
      a.shop ||
      a.neighbourhood ||
      a.suburb ||
      a.quarter ||
      a.village ||
      a.town ||
      a.city_district ||
      a.city ||
      a.county ||
      '';
    return name;
  } catch {
    return '';
  }
}

export default function RectangleDrawer({ active, color, onDrawn }) {
  const map          = useMap();
  const startRef     = useRef(null);
  const rectLayerRef = useRef(null);
  const isDrawing    = useRef(false);

  useEffect(() => {
    if (!active) return;

    map.dragging.disable();
    map.getContainer().style.cursor = 'crosshair';

    function onMouseDown(e) {
      if (e.originalEvent.button !== 0) return;
      isDrawing.current = true;
      startRef.current  = e.latlng;
      if (rectLayerRef.current) { map.removeLayer(rectLayerRef.current); rectLayerRef.current = null; }
    }

    function onMouseMove(e) {
      if (!isDrawing.current || !startRef.current) return;
      const pts = rectPoints(startRef.current, e.latlng);
      if (rectLayerRef.current) map.removeLayer(rectLayerRef.current);
      rectLayerRef.current = L.polygon(pts, {
        color, fillColor: color, fillOpacity: 0.18, weight: 2, dashArray: '5 5',
      }).addTo(map);
    }

    async function onMouseUp(e) {
      if (!isDrawing.current || !startRef.current) return;
      isDrawing.current = false;

      const pts = rectPoints(startRef.current, e.latlng);
      if (rectLayerRef.current) { map.removeLayer(rectLayerRef.current); rectLayerRef.current = null; }

      const latDiff = Math.abs(pts[0][0] - pts[2][0]);
      const lngDiff = Math.abs(pts[0][1] - pts[2][1]);
      if (latDiff < 0.0001 || lngDiff < 0.0001) { startRef.current = null; return; }

      // Calculate center of rectangle
      const centerLat = (pts[0][0] + pts[2][0]) / 2;
      const centerLng = (pts[0][1] + pts[2][1]) / 2;

      startRef.current = null;

      // Reverse geocode center to get place name
      const placeName = await reversGeocode(centerLat, centerLng);

      onDrawn(
        pts.map(([lat, lng]) => ({
          lat: parseFloat(lat.toFixed(6)),
          lng: parseFloat(lng.toFixed(6)),
        })),
        placeName
      );
    }

    map.on('mousedown', onMouseDown);
    map.on('mousemove', onMouseMove);
    map.on('mouseup',   onMouseUp);

    return () => {
      map.dragging.enable();
      map.getContainer().style.cursor = '';
      map.off('mousedown', onMouseDown);
      map.off('mousemove', onMouseMove);
      map.off('mouseup',   onMouseUp);
      if (rectLayerRef.current) { map.removeLayer(rectLayerRef.current); rectLayerRef.current = null; }
      isDrawing.current = false;
      startRef.current  = null;
    };
  }, [active, color, map, onDrawn]);

  return null;
}
