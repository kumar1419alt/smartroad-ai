/**
 * MiniRoadMap.jsx — Interactive mini GIS map showing reported road issues in Pune.
 *
 * Implements:
 *  - Leaflet map centered at Pune coordinates [18.5204, 73.8567]
 *  - Color-coded circular markers indicating damage severity and repair status
 *  - Interactive popup with complaint ID, road landmark, and SRPS score
 *  - Clean mount/unmount cleanup to avoid React 19 duplicate map instance errors
 */

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { MapPin, Maximize2, Layers, AlertTriangle } from 'lucide-react'

// Severity colors
const SEVERITY_COLORS = {
  critical: '#ef4444', // Red
  high: '#f97316',     // Orange
  medium: '#eab308',   // Amber
  resolved: '#10b981', // Emerald
}

export default function MiniRoadMap({
  complaints = [],
  center = [18.5204, 73.8567], // Pune center
  zoom = 12,
  onSelectComplaint,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    // Base tile layer — clean OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Add markers for each complaint with coordinates
    complaints.forEach((item) => {
      if (!item.coordinates || item.coordinates.length !== 2) return

      const isResolved = (item.status || '').toLowerCase().includes('resolved')
      const color = isResolved
        ? SEVERITY_COLORS.resolved
        : SEVERITY_COLORS[item.severity] || '#3b82f6'

      // Custom pulsing SVG circle marker
      const marker = L.circleMarker(item.coordinates, {
        radius: isResolved ? 7 : 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map)

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; min-width: 170px; line-height: 1.4;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${item.id}</div>
          <div style="font-weight: 600; color: #2563eb; font-size: 11px;">${item.damageType}</div>
          <div style="color: #64748b; font-size: 11px; margin: 3px 0 6px 0;">${item.location}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span style="font-size: 10px; font-weight: 600; color: #475569;">SRPS: ${item.priority}/100</span>
            <span style="font-size: 10px; font-weight: 700; color: ${color};">${item.status}</span>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      marker.on('click', () => {
        setSelectedIssue(item)
        if (onSelectComplaint) onSelectComplaint(item)
      })
    })

    // Auto-fit bounds if we have multiple valid coordinates
    const validCoords = complaints
      .filter((c) => c.coordinates && c.coordinates.length === 2)
      .map((c) => c.coordinates)

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords)
      map.fitBounds(bounds, { padding: [30, 30] })
    }

    // Invalidate size to guarantee crisp rendering
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
  }, [complaints])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin size={16} className="text-blue-600" />
            Pune Road Hazard Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live sample incidents across Deccan, Kothrud, Baner, and Hinjewadi
          </p>
        </div>

        <Link
          to="/citizen/map"
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="Open full interactive map"
        >
          <Maximize2 size={12} />
          <span className="hidden sm:inline">Full Map</span>
        </Link>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[300px] rounded-xl overflow-hidden border border-slate-200">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Floating Legend */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[10px] space-y-1">
          <span className="font-bold text-slate-700 block">Severity Legend</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> High
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Click markers to view complaint details & PMC repair squad</span>
        <span className="font-semibold text-blue-600">{complaints.length} locations mapped</span>
      </div>
    </div>
  )
}
