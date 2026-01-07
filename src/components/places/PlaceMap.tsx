"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PlaceData } from "./PlaceCard";
import L from "leaflet";
import { Star } from "lucide-react";

// Fix for default marker icons in Next.js
// Leaflet's default icon paths are broken by webpack/next.js build process
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PlaceMapProps {
    places: PlaceData[];
    center?: [number, number]; // Default center
    zoom?: number;
    onPlaceClick?: (place: PlaceData) => void;
}

export default function PlaceMap({ places, center = [-33.8688, 151.2093], zoom = 12, onPlaceClick }: PlaceMapProps) {
    // Filter places with valid coordinates
    const validPlaces = places.filter(p => p.lat && p.lng);

    return (
        <div className="h-[500px] w-full rounded-lg overflow-hidden border z-0 relative">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validPlaces.map((place) => (
                    <Marker
                        key={place.id}
                        position={[place.lat!, place.lng!]}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                <div className="font-bold text-sm mb-1">{place.name}</div>
                                <div className="text-xs text-muted-foreground mb-2">{place.category}</div>
                                {place.rating && (
                                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-2">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="font-medium">{place.rating}</span>
                                    </div>
                                )}
                                {onPlaceClick && (
                                    <button
                                        onClick={() => onPlaceClick(place)}
                                        className="mt-2 w-full text-xs text-blue-600 hover:underline font-medium text-center py-1 px-2 rounded hover:bg-blue-50 transition-colors"
                                    >
                                        상세보기
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            {validPlaces.length === 0 && (
                <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                    <div className="bg-background px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                        표시할 위치 데이터가 없습니다. SQL 스크립트를 실행해주세요.
                    </div>
                </div>
            )}
        </div>
    );
}
