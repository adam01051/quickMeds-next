import React, { useEffect, useMemo } from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLng } from '../../utils/coordinates';

interface PharmacyMapProps {
	marker: LatLng | null;
	onMarkerChange?: (marker: LatLng) => void;
	readOnly?: boolean;
	className?: string;
}

const DEFAULT_CENTER: LatLng = { lat: 41.3111, lng: 69.2797 };

const markerIcon = divIcon({
	className: 'pharmacy-location-map__marker',
	html: '<span></span>',
	iconSize: [34, 34],
	iconAnchor: [17, 32],
});

const MapEvents = ({ onMarkerChange, readOnly }: Pick<PharmacyMapProps, 'onMarkerChange' | 'readOnly'>) => {
	useMapEvents({
		click(event) {
			if (!readOnly && onMarkerChange) onMarkerChange({ lat: event.latlng.lat, lng: event.latlng.lng });
		},
	});
	return null;
};

const MapCenterSync = ({ marker }: { marker: LatLng | null }) => {
	const map = useMap();

	useEffect(() => {
		if (marker) map.setView([marker.lat, marker.lng], Math.max(map.getZoom(), 15), { animate: true });
	}, [map, marker]);

	return null;
};

const PharmacyMap = ({ marker, onMarkerChange, readOnly = false, className = '' }: PharmacyMapProps) => {
	const center = marker ?? DEFAULT_CENTER;
	const markerPosition = useMemo<[number, number] | null>(() => marker ? [marker.lat, marker.lng] : null, [marker]);
	const canEditMarker = Boolean(onMarkerChange && !readOnly);

	return (
		<MapContainer
			className={`pharmacy-location-map ${className}`.trim()}
			center={[center.lat, center.lng]}
			zoom={marker ? 15 : 12}
			scrollWheelZoom={!readOnly}
			dragging
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<MapEvents onMarkerChange={onMarkerChange} readOnly={readOnly} />
			<MapCenterSync marker={marker} />
			{markerPosition && (
				<Marker
					position={markerPosition}
					icon={markerIcon}
					draggable={canEditMarker}
					eventHandlers={
						canEditMarker
							? {
									dragend(event) {
										const next = event.target.getLatLng();
										onMarkerChange?.({ lat: next.lat, lng: next.lng });
									},
							  }
							: undefined
					}
				/>
			)}
		</MapContainer>
	);
};

export default PharmacyMap;
