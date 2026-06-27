import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import L from 'leaflet';

type Props = {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
};

const customIcon = new L.DivIcon({
    html: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="#ef4444"
            viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
        </svg>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

function LocationMarker({ latitude, longitude, onChange }: Props) {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    if (!latitude || !longitude) return null;

    return <Marker position={[latitude, longitude]} icon={customIcon} />;
}

export default function OfficeMapPicker({ latitude, longitude, onChange }: Props) {
    const center: LatLngExpression = latitude && longitude ? [latitude, longitude] : [-7.2575, 112.7521]; // Surabaya

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{
                height: '400px',
                width: '100%',
            }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker latitude={latitude} longitude={longitude} onChange={onChange} />
        </MapContainer>
    );
}
