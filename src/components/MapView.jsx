import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;">
    <div style="width:18px;height:18px;background:#38bdf8;border:3px solid #0b1220;border-radius:50%;box-shadow:0 0 0 5px rgba(56,189,248,0.35), 0 0 30px rgba(56,189,248,0.8);"></div>
  </div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const stopIcon = (n) => L.divIcon({
  className: "",
  html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#38bdf8,#c084fc);color:#0b1220;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Inter;font-weight:800;border:3px solid #0b1220;box-shadow:0 8px 20px rgba(56,189,248,0.4);">${n}</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const poiIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#f472b6;border:2px solid #0b1220;border-radius:50%;box-shadow:0 0 0 3px rgba(244,114,182,0.35);"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});

const Recenter = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, map.getZoom(), { duration: 0.8 }); }, [center, map]);
  return null;
};

const MapView = ({ center, zoom = 12, userLocation, markers = [], route = null, height = "420px", tileTheme = "dark", pois = [] }) => {
  const c = center || [22.5937, 78.9629];
  const routeCoords = useMemo(() => (route?.stops || []).map((s) => [s.lat, s.lon]), [route]);
  const mapRef = useRef();
  const tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40" style={{ height }}>
      <MapContainer ref={mapRef} center={c} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer attribution='&copy; OpenStreetMap' url={tileUrl} />
        {center && <Recenter center={center} />}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {markers.map((m, i) => (
          <Marker key={m.id || i} position={[m.lat, m.lon]} icon={m.index ? stopIcon(m.index) : defaultIcon}>
            <Popup><strong>{m.name}</strong>{m.subtitle && <div>{m.subtitle}</div>}</Popup>
          </Marker>
        ))}
        {pois.map((p, i) => (
          <Marker key={"poi-" + i} position={[p.lat, p.lon]} icon={poiIcon}>
            <Popup><strong>{p.name}</strong>{p.category && <div style={{ textTransform: "capitalize" }}>{p.category}</div>}</Popup>
          </Marker>
        ))}
        {routeCoords.length > 1 && <Polyline positions={routeCoords} pathOptions={{ color: "#38bdf8", weight: 4, opacity: 0.9, dashArray: "10 8" }} />}
      </MapContainer>
    </div>
  );
};

export default MapView;
