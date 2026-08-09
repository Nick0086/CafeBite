import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, ChevronUp, ChevronDown } from 'lucide-react';

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
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const circleLayerRef = useRef(null);
    const markerLayerGroupRef = useRef(null);
    const [mobileExpanded, setMobileExpanded] = useState(false);

    useEffect(() => {
        if (!mapRef.current) return;

        if (!mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [centerCoords.lat, centerCoords.lng],
                zoom: 15,
                zoomControl: true,
                scrollWheelZoom: false,
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
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl w-full">
            {/* Mobile Header Bar to toggle map size */}
            <div className="lg:hidden px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold">
                    <Map className="w-3.5 h-3.5 text-indigo-400" />
                    Radar Map View
                </span>
                <button
                    onClick={() => setMobileExpanded((v) => !v)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 active:scale-95 transition-transform"
                >
                    <span>{mobileExpanded ? 'Compact Map' : 'Expand Map'}</span>
                    {mobileExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
            </div>

            {/* Responsive Map Container with max 60dvh */}
            <div className={`relative w-full ${mobileExpanded ? 'h-72 sm:h-96' : 'h-48 sm:h-64'} lg:h-[60dvh] max-h-[60dvh] transition-all duration-200`}>
                <div ref={mapRef} className="w-full h-full z-10" />
                
                {/* Lat / Lng Pill Badge */}
                <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 text-[10px] sm:text-xs text-slate-200 flex items-center gap-1.5 pointer-events-none shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-[10px]">({centerCoords.lat.toFixed(4)}, {centerCoords.lng.toFixed(4)})</span>
                </div>
            </div>
        </div>
    );
}

export default LeadDiscoveryMap;
