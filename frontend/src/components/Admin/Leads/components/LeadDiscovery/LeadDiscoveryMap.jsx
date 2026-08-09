import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export function LeadDiscoveryMap({
    centerCoords,
    selectedRadius,
    locationInput,
    discoveryData,
    onMapClick,
    heightClass = "h-60 sm:h-80 lg:h-[540px]"
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const circleLayerRef = useRef(null);
    const markerLayerGroupRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [centerCoords.lat, centerCoords.lng],
                zoom: 15,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            markerLayerGroupRef.current = L.layerGroup().addTo(map);

            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (onMapClick) onMapClick(lat, lng);
            });

            mapInstanceRef.current = map;
        } else {
            mapInstanceRef.current.setView([centerCoords.lat, centerCoords.lng], 15);
        }

        if (circleLayerRef.current) {
            mapInstanceRef.current.removeLayer(circleLayerRef.current);
        }

        circleLayerRef.current = L.circle([centerCoords.lat, centerCoords.lng], {
            color: '#6366f1',
            fillColor: '#818cf8',
            fillOpacity: 0.2,
            radius: selectedRadius,
        }).addTo(mapInstanceRef.current);

        if (markerLayerGroupRef.current) {
            markerLayerGroupRef.current.clearLayers();

            L.marker([centerCoords.lat, centerCoords.lng], { icon: defaultIcon })
                .bindPopup(`<b>Target Center</b><br/>${locationInput}`)
                .addTo(markerLayerGroupRef.current);

            if (discoveryData?.leads) {
                discoveryData.leads.forEach((lead) => {
                    if (lead.latitude && lead.longitude) {
                        const isDup = lead.duplicateStatus !== 'NEW';
                        const circleMarker = L.circleMarker([lead.latitude, lead.longitude], {
                            radius: 7,
                            color: isDup ? '#f43f5e' : '#10b981',
                            fillColor: isDup ? '#fb7185' : '#34d399',
                            fillOpacity: 0.8,
                        });

                        circleMarker.bindPopup(`
                            <div style="font-family: sans-serif; font-size: 12px;">
                                <b>${lead.restaurant_name}</b><br/>
                                <span style="color: #64748b;">${lead.cuisine || 'Restaurant'}</span><br/>
                                <span style="font-weight: bold; color: ${isDup ? '#e11d48' : '#059669'};">
                                    ${lead.duplicateStatus === 'NEW' ? '✓ Verified New Lead' : '⚠ ' + lead.duplicateStatus}
                                </span>
                            </div>
                        `);

                        circleMarker.addTo(markerLayerGroupRef.current);
                    }
                });
            }
        }
    }, [centerCoords, selectedRadius, discoveryData, locationInput, onMapClick]);

    return (
        <div className={`relative ${heightClass} rounded-xl overflow-hidden`}>
            <div ref={mapRef} className="w-full h-full z-10" />
            <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-center gap-2 pointer-events-none shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-[11px]">Center: ({centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)})</span>
            </div>
        </div>
    );
}

export default LeadDiscoveryMap;
