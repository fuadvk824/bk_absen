import { useEffect } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

interface Office {
    name: string;
    latitude: number | string | null;
    longitude: number | string | null;
    radius_meter: number | string | null;
}

interface Props {
    office: Office;
    latitude: number | null;
    longitude: number | null;
    onSelect: (latitude: number, longitude: number) => void;
}

const officeIcon = new L.DivIcon({
    html: `
        <div style="
            background:#2563eb;
            color:white;
            width:32px;
            height:32px;
            display:flex;
            align-items:center;
            justify-content:center;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 8px #0003;
            font-size:17px;
        ">K</div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const selectedIcon = new L.DivIcon({
    html: `
        <div style="
            background:#dc2626;
            width:22px;
            height:22px;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 8px #0004;
        "></div>
    `,
    className: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

function MapClickHandler({ onSelect }: { onSelect: Props['onSelect'] }) {
    useMapEvents({
        click(event) {
            onSelect(Number(event.latlng.lat.toFixed(7)), Number(event.latlng.lng.toFixed(7)));
        },
    });

    return null;
}

function FitOffice({ office }: { office: Office }) {
    const map = useMap();

    useEffect(() => {
        const lat = Number(office.latitude);
        const lng = Number(office.longitude);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            map.setView([lat, lng], 17);
        }
    }, [map, office.latitude, office.longitude]);

    return null;
}

export default function AttendanceLocationPicker({ office, latitude, longitude, onSelect }: Props) {
    const officeLat = Number(office.latitude);
    const officeLng = Number(office.longitude);

    if (office.latitude == null || office.longitude == null || !Number.isFinite(officeLat) || !Number.isFinite(officeLng)) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Koordinat kantor belum tersedia. Lengkapi data lokasi kantor terlebih dahulu.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-xs">
                <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                    Lokasi kantor
                </span>

                <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-600" />
                    Titik check-in pilihan
                </span>
            </div>

            <div className="overflow-hidden rounded-xl border">
                <MapContainer
                    key={`${officeLat}-${officeLng}`}
                    center={[officeLat, officeLng]}
                    zoom={17}
                    scrollWheelZoom
                    style={{ height: 400, width: '100%' }}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitOffice office={office} />

                    <Circle
                        center={[officeLat, officeLng]}
                        radius={Number(office.radius_meter ?? 0)}
                        pathOptions={{
                            color: '#2563eb',
                            fillColor: '#3b82f6',
                            fillOpacity: 0.12,
                        }}
                    />

                    <Marker position={[officeLat, officeLng]} icon={officeIcon}>
                        <Popup>
                            <strong>{office.name}</strong>
                            <br />
                            Lokasi kantor
                        </Popup>
                    </Marker>

                    {latitude !== null && longitude !== null && (
                        <Marker position={[latitude, longitude]} icon={selectedIcon}>
                            <Popup>
                                Titik check-in pilihan
                                <br />
                                {latitude}, {longitude}
                            </Popup>
                        </Marker>
                    )}

                    <MapClickHandler onSelect={onSelect} />
                </MapContainer>
            </div>

            <p className="text-xs text-muted-foreground">
                Klik pada peta untuk memilih titik koordinat check-in. Kamu bisa memperbesar peta untuk memilih titik yang
                lebih akurat.
            </p>
        </div>
    );
}
