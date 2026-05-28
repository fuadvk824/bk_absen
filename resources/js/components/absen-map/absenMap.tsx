// import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';

// type Props = {
//   office: {
//     lat: number;
//     lng: number;
//     radius: number;
//   };
//   userLocation?: {
//     lat: number;
//     lng: number;
//   };
// };

// export default function AbsenMap({ office, userLocation }: Props) {
//   return (
//     <MapContainer
//       center={[office.lat, office.lng]}
//       zoom={17}
//       style={{ height: '400px', width: '100%' }}
//     >
//       <TileLayer
//         attribution="© OpenStreetMap"
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />

//       {/* Kantor */}
//       <Marker position={[office.lat, office.lng]}>
//         <Popup>Kantor</Popup>
//       </Marker>

//       <Circle
//         center={[office.lat, office.lng]}
//         radius={office.radius}
//         pathOptions={{ color: 'green' }}
//       />

//       {/* User */}
//       {userLocation && (
//         <Marker position={[userLocation.lat, userLocation.lng]}>
//           <Popup>Lokasi kamu</Popup>
//         </Marker>
//       )}
//     </MapContainer>
//   );
// }
