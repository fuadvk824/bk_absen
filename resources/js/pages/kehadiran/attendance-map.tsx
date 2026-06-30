import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { LatLngBounds, DivIcon } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface Props {
    office: {
        name: string;
        latitude: number;
        longitude: number;
        radius_meter: number;
    };

    latitude: number | null;
    longitude: number | null;
}

const officeIcon = new DivIcon({
    html: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#2563eb"
        >
            <path d="M4 22h16v-2h-2V4H6v16H4zm4-14h2v2H8V8zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-8h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
        </svg>
    `,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -18],
});

const employeeIcon = new DivIcon({
    html: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="#ef4444"
        >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle
                cx="12"
                cy="9"
                r="3"
                fill="white"
            />
        </svg>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -24],
});

function AutoFit({ office, latitude, longitude }: Props) {
    const map = useMap();

    useEffect(() => {
        if (latitude == null || longitude == null) {
            map.setView([office.latitude, office.longitude], 17);
            return;
        }

        const bounds = new LatLngBounds([
            [office.latitude, office.longitude],
            [latitude, longitude],
        ]);

        map.fitBounds(bounds, {
            padding: [60, 60],
        });
    }, [latitude, longitude]);

    return null;
}

export default function AttendanceMap({ office, latitude, longitude }: Props) {
    return (
        <MapContainer
            center={[office.latitude, office.longitude]}
            zoom={17}
            scrollWheelZoom={true}
            style={{
                height: 420,
                width: '100%',
                borderRadius: 12,
            }}
        >
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <AutoFit office={office} latitude={latitude} longitude={longitude} />

            <Circle
                center={[office.latitude, office.longitude]}
                radius={office.radius_meter}
                pathOptions={{
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.08,
                }}
            />

            <Marker position={[office.latitude, office.longitude]} icon={officeIcon}>
                <Popup>
                    <div className="text-sm">
                        <div className="font-semibold">{office.name}</div>
                        Radius:
                        <b> {office.radius_meter} meter</b>
                    </div>
                </Popup>
            </Marker>

           {latitude != null && longitude != null && (
                <>
                    <Marker position={[latitude, longitude]} icon={employeeIcon}>
                        <Popup>
                            <div className="text-sm">
                                <strong>Lokasi Check In</strong>
                                <br />
                                Lat: {latitude}
                                <br />
                                Lng: {longitude}
                            </div>
                        </Popup>
                    </Marker>

                    <Polyline
                        positions={[
                            [office.latitude, office.longitude],
                            [latitude, longitude],
                        ]}
                        pathOptions={{
                            color: '#ef4444',
                            weight: 3,
                            dashArray: '8',
                        }}
                    />
                </>
            )}
        </MapContainer>
    );
}
