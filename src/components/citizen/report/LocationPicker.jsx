/**
 * LocationPicker.jsx — Reusable interactive map location selector.
 *
 * Features:
 *  - "Use My Current Location" via HTML5 Geolocation API
 *  - Interactive Leaflet map with a draggable marker
 *  - Manual Latitude & Longitude coordinate inputs with validation
 *  - Pune landmark quick-select presets for testing
 *  - Handles permission denials gracefully with informative alerts
 */

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import {
  MapPin,
  Navigation,
  Compass,
  AlertCircle,
  CheckCircle2,
  Search,
  Crosshair,
} from 'lucide-react'

// Default center: Pune, Fergusson College Road
const DEFAULT_CENTER = [18.5186, 73.8415]

const PUNE_LOCATION_PRESETS = [
  { name: 'FC Road (Goodluck Chowk)', coords: [18.5186, 73.8415], ward: 'Ward 14 (Shivajinagar - Deccan)' },
  { name: 'Senapati Bapat Road (ICC Towers)', coords: [18.5342, 73.8296], ward: 'Ward 10 (Gokhale Nagar - SB Road)' },
  { name: 'Hinjewadi Phase 1 (Shivaji Chowk)', coords: [18.5913, 73.7389], ward: 'Wakad-Hinjewadi IT Corridor' },
  { name: 'Baner Road (Balewadi High St)', coords: [18.5590, 73.7868], ward: 'Ward 8 (Aundh - Baner)' },
  { name: 'Paud Road (Karve Statue, Kothrud)', coords: [18.5074, 73.8077], ward: 'Ward 12 (Kothrud - Bavdhan)' },
]

export default function LocationPicker({
  latitude,
  longitude,
  locationName,
  onLocationChange,
  error,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [geoLoading, setGeoLoading] = useState(false)
  const [geoMessage, setGeoMessage] = useState('')
  const [geoStatus, setGeoStatus] = useState(null) // 'success' | 'error' | null

  const currentLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : DEFAULT_CENTER[0]
  const currentLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : DEFAULT_CENTER[1]

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
    })

    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Custom draggable pulse pin icon
    const icon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background-color: #2563eb;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
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
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    })

    const marker = L.marker([currentLat, currentLng], {
      draggable: true,
      icon,
    }).addTo(map)

    markerRef.current = marker

    marker.bindPopup('<strong>Selected Incident Location</strong><br/>Drag pin to pinpoint road defect').openPopup()

    // Handle marker drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      const newLat = parseFloat(pos.lat.toFixed(6))
      const newLng = parseFloat(pos.lng.toFixed(6))
      onLocationChange({
        latitude: newLat,
        longitude: newLng,
        source: 'map_drag',
      })
    })

    // Handle map click to reposition marker
    map.on('click', (e) => {
      const newLat = parseFloat(e.latlng.lat.toFixed(6))
      const newLng = parseFloat(e.latlng.lng.toFixed(6))
      marker.setLatLng([newLat, newLng])
      map.panTo([newLat, newLng])
      onLocationChange({
        latitude: newLat,
        longitude: newLng,
        source: 'map_click',
      })
    })

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
  }, [])

  // Sync marker position when lat/lng props change from outside
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng()
      if (Math.abs(currentPos.lat - currentLat) > 0.0001 || Math.abs(currentPos.lng - currentLng) > 0.0001) {
        markerRef.current.setLatLng([currentLat, currentLng])
        mapInstanceRef.current.panTo([currentLat, currentLng])
      }
    }
  }, [currentLat, currentLng])

  // Geolocation API handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoMessage('Geolocation is not supported by your browser. Please enter coordinates manually.')
      return
    }

    setGeoLoading(true)
    setGeoMessage('')
    setGeoStatus(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6))
        const lng = parseFloat(position.coords.longitude.toFixed(6))

        setGeoLoading(false)
        setGeoStatus('success')
        setGeoMessage(`GPS location acquired (±${Math.round(position.coords.accuracy)}m accuracy)`)

        onLocationChange({
          latitude: lat,
          longitude: lng,
          source: 'gps',
        })
      },
      (err) => {
        setGeoLoading(false)
        setGeoStatus('error')
        if (err.code === err.PERMISSION_DENIED) {
          setGeoMessage('Location permission was denied. You can drag the pin on the map or type coordinates below.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoMessage('Location information is unavailable. Using manual entry.')
        } else {
          setGeoMessage('Location request timed out. Please drag the pin on the map.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  const handleManualCoordChange = (field, val) => {
    const num = parseFloat(val)
    if (!isNaN(num)) {
      onLocationChange({
        latitude: field === 'lat' ? num : currentLat,
        longitude: field === 'lng' ? num : currentLng,
        source: 'manual_input',
      })
    }
  }

  const handleApplyPreset = (preset) => {
    onLocationChange({
      latitude: preset.coords[0],
      longitude: preset.coords[1],
      locationName: preset.name,
      ward: preset.ward,
      source: 'preset',
    })
  }

  return (
    <div className="space-y-4">
      {/* Geolocation Trigger & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-xs transition-colors"
        >
          <Navigation size={14} className={geoLoading ? 'animate-spin' : ''} />
          <span>{geoLoading ? 'Acquiring GPS Signal…' : 'Use My Current Location'}</span>
        </button>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Click map or drag pin to position road hazard
        </span>
      </div>

      {/* Geolocation feedback banner */}
      {geoMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            geoStatus === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {geoStatus === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-amber-500 shrink-0" />
          )}
          <span>{geoMessage}</span>
        </div>
      )}

      {/* Quick Landmark Preset Pills */}
      <div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Or Select Pune Landmark Preset (1-Click Demo):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PUNE_LOCATION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Preview Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
        <div ref={mapContainerRef} className="h-64 sm:h-72 w-full z-0" />
        <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5">
          <Crosshair size={12} className="text-blue-600" />
          <span>Interactive Pin Active</span>
        </div>
      </div>

      {/* Manual Latitude & Longitude inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Latitude (°N)
          </label>
          <input
            type="number"
            step="0.000001"
            value={currentLat}
            onChange={(e) => handleManualCoordChange('lat', e.target.value)}
            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Longitude (°E)
          </label>
          <input
            type="number"
            step="0.000001"
            value={currentLng}
            onChange={(e) => handleManualCoordChange('lng', e.target.value)}
            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
