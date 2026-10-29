/**
 * MapPage — GIS incident map.
 * Full Leaflet integration in Phase 2.
 */

import React from 'react'
import { MapPin } from 'lucide-react'
import { Card } from '../components/ui'

export default function MapPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Incident Map</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          GIS-based spatial view of all reported road damage incidents
        </p>
      </div>
      <Card noPadding className="overflow-hidden">
        <div className="flex items-center justify-center h-[70vh] bg-slate-100 text-slate-400 text-sm">
          <span className="flex flex-col items-center gap-3">
            <span className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
              <MapPin size={24} className="text-slate-400" />
            </span>
            <span>Leaflet map — Phase 2</span>
          </span>
        </div>
      </Card>
    </div>
  )
}
