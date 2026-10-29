/**
 * MapLegend.jsx
 *
 * Floating legend rendered as a Leaflet custom Control using useMap().
 * Avoids React portal complexity by using a simple DOM-based render.
 */

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

const ITEMS = [
  { color: '#ef4444', label: 'Critical',  note: '● pulse' },
  { color: '#f97316', label: 'High',      note: '' },
  { color: '#eab308', label: 'Medium',    note: '' },
  { color: '#22c55e', label: 'Low',       note: '' },
  { color: '#10b981', label: 'Resolved',  note: '' },
]

export default function MapLegend() {
  const map = useMap()

  useEffect(() => {
    const Legend = L.Control.extend({
      options: { position: 'bottomleft' },

      onAdd() {
        const container = L.DomUtil.create('div')
        L.DomEvent.disableClickPropagation(container)
        L.DomEvent.disableScrollPropagation(container)

        container.innerHTML = `
          <div style="
            background:rgba(255,255,255,0.97);
            backdrop-filter:blur(6px);
            border:1px solid #e2e8f0;
            border-radius:12px;
            padding:10px 14px;
            box-shadow:0 2px 12px rgba(0,0,0,0.10);
            font-family:Inter,system-ui,sans-serif;
            min-width:150px;
          ">
            <div style="font-weight:700;font-size:10px;color:#0f172a;margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em;">
              Severity Legend
            </div>
            ${ITEMS.map(({ color, label, note }) => `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                <div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,.15);flex-shrink:0;"></div>
                <span style="font-size:11px;font-weight:600;color:#475569;">${label}</span>
                ${note ? `<span style="font-size:9px;font-weight:700;color:#ef4444;background:#fef2f2;border-radius:4px;padding:1px 5px;">${note}</span>` : ''}
              </div>
            `).join('')}
            <div style="border-top:1px solid #f1f5f9;margin-top:6px;padding-top:6px;font-size:10px;color:#94a3b8;line-height:1.5;">
              Click marker to view details
            </div>
          </div>
        `
        return container
      },
    })

    const legend = new Legend()
    legend.addTo(map)

    return () => { legend.remove() }
  }, [map])

  return null
}
