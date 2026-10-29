/**
 * LocationMapCard.jsx — Interactive GIS map view focused on the complaint's coordinates.
 */

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapPin, Navigation, Compass, Layers } from 'lucide-react'

export default function LocationMapCard({ complaint }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const coords = complaint?.coordinates && complaint.coordinates.length === 2
    ? complaint.coordinates
    : [18.5186, 73.8415] // Default FC Road

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Pulse marker
    const icon = L.divIcon({
      className: 'custom-detail-pin',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #ef4444;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })

    const marker = L.marker(coords, { icon }).addTo(map)

    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
        <strong style="color: #0f172a;">${complaint?.id || 'PMC Incident'}</strong><br/>
        <span style="color: #2563eb; font-weight: 600;">${complaint?.damageType || 'Road Defect'}</span><br/>
        <span style="color: #64748b; font-size: 11px;">${complaint?.location || 'Pune'}</span>
      </div>
    `).openPopup()

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [coords, complaint])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />
            <span>GIS Location & Spatial Coordinates</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic positioning on the Pune Municipal road grid
          </p>
        </div>

        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          {coords[0].toFixed(4)}°N, {coords[1].toFixed(4)}°E
        </span>
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-64 sm:h-72 w-full bg-slate-100 shadow-2xs">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
      </div>

      {/* Address Bar */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-bold text-slate-900 block">
            {complaint?.location}
          </span>
          <span className="text-slate-500 text-[11px] block mt-0.5">
            {complaint?.ward}
          </span>
        </div>

        <span className="text-blue-600 font-semibold text-[11px] self-start sm:self-auto">
          Zone-C Road Network
        </span>
      </div>
    </div>
  )
}
