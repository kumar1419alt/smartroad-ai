/**
 * srpsCalculator.js — Smart Road Repair Priority Score (SRPS) Model.
 *
 * Mathematical Formulation:
 *   SRPS = w1·S + w2·T + w3·L + w4·R + w5·C
 *
 * Current Initial / Demonstration Heuristic Weights:
 *   w1 (S - Damage Severity)         = 0.35
 *   w2 (T - Traffic Importance)      = 0.25
 *   w3 (L - Location Criticality)    = 0.20
 *   w4 (R - Road Importance)         = 0.15
 *   w5 (C - Citizen Reports / Crowd) = 0.05
 *
 * Total weight: 0.35 + 0.25 + 0.20 + 0.15 + 0.05 = 1.00 (100%)
 *
 * DISCLAIMER:
 * These weights are initial demonstration / simulated baseline parameters.
 * The SRPS framework is currently under academic and technical evaluation
 * and is NOT claimed to be experimentally proven or calibrated via longitudinal
 * pavement life-cycle field trials yet.
 */

export const SRPS_DEMO_WEIGHTS = {
  S: 0.35, // Damage Severity
  T: 0.25, // Traffic Importance
  L: 0.20, // Location Criticality
  R: 0.15, // Road Importance
  C: 0.05, // Citizen Reports
}

export const FACTOR_METADATA = {
  S: {
    key: 'S',
    name: 'Damage Severity',
    symbol: 'S',
    weight: SRPS_DEMO_WEIGHTS.S,
    weightPct: '35%',
    unit: 'Structural Index',
    description: 'Physical depth (>10cm), defect perimeter, crack expansion, and vehicle tire damage risk.',
    source: 'Computer Vision Defect Ingestion (YOLOv8)',
    color: '#ef4444',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
  },
  T: {
    key: 'T',
    name: 'Traffic Importance',
    symbol: 'T',
    weight: SRPS_DEMO_WEIGHTS.T,
    weightPct: '25%',
    unit: 'PCU / Volume Index',
    description: 'Average daily passenger car units (PCU), transit frequency, and peak-hour passenger throughput.',
    source: 'Municipal Traffic GIS Sensor Layer',
    color: '#f97316',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  L: {
    key: 'L',
    name: 'Location Criticality',
    symbol: 'L',
    weight: SRPS_DEMO_WEIGHTS.L,
    weightPct: '20%',
    unit: 'Proximity Score',
    description: 'Geospatial proximity to emergency response facilities, hospitals, schools, and transit terminals.',
    source: 'GIS Point-of-Interest (POI) Buffer Analysis',
    color: '#3b82f6',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  R: {
    key: 'R',
    name: 'Road Importance',
    symbol: 'R',
    weight: SRPS_DEMO_WEIGHTS.R,
    weightPct: '15%',
    unit: 'Hierarchy Class',
    description: 'Municipal road hierarchy: Expressways / Major Arterials vs Distributor vs Local ward streets.',
    source: 'Municipal Master Plan Road Classification',
    color: '#8b5cf6',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  C: {
    key: 'C',
    name: 'Citizen Reports',
    symbol: 'C',
    weight: SRPS_DEMO_WEIGHTS.C,
    weightPct: '5%',
    unit: 'Feedback Volume',
    description: 'Crowd-sourced citizen reporting volume, duplicate report clustering, and community confirmations.',
    source: 'Citizen Mobile App Verification Registry',
    color: '#10b981',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
}

/**
 * Derives normalized 0-100 factor values for any road damage complaint.
 * Ensures realistic, transparent numbers matching municipal road characteristics.
 */
export function deriveFactorsForComplaint(complaint) {
  const sev = (complaint.severity || 'medium').toLowerCase()
  const loc = (complaint.location || '').toLowerCase()
  const upvotes = complaint.upvotes || 15

  // 1. Severity Score S (0 - 100)
  let S = 60
  if (sev === 'critical') S = 96
  else if (sev === 'high') S = 82
  else if (sev === 'medium') S = 60
  else if (sev === 'low') S = 42

  // 2. Traffic Importance T (0 - 100)
  let T = 70
  if (loc.includes('fc road') || loc.includes('hinjewadi') || loc.includes('highway') || loc.includes('wakad')) {
    T = 94
  } else if (loc.includes('senapati bapat') || loc.includes('karve') || loc.includes('swargate')) {
    T = 88
  } else if (loc.includes('baner') || loc.includes('nagar road') || loc.includes('katraj')) {
    T = 82
  } else if (loc.includes('paud road') || loc.includes('viman nagar') || loc.includes('kondhwa')) {
    T = 74
  } else {
    T = 52
  }

  // 3. Location Criticality L (0 - 100)
  let L = 65
  if (loc.includes('goodluck') || loc.includes('icc') || loc.includes('hospital') || loc.includes('nal stop')) {
    L = 92
  } else if (loc.includes('shivaji chowk') || loc.includes('flyover') || loc.includes('underpass')) {
    L = 86
  } else if (loc.includes('school') || loc.includes('station') || loc.includes('market')) {
    L = 78
  } else if (loc.includes('balewadi') || loc.includes('kharadi') || loc.includes('magarpatta')) {
    L = 72
  } else {
    L = 50
  }

  // 4. Road Importance R (0 - 100)
  let R = 60
  if (loc.includes('highway') || loc.includes('fc road') || loc.includes('nh-') || loc.includes('expressway')) {
    R = 95
  } else if (loc.includes('senapati bapat') || loc.includes('baner road') || loc.includes('nagar road') || loc.includes('karve road')) {
    R = 86
  } else if (loc.includes('hinjewadi phase') || loc.includes('paud road') || loc.includes('swargate')) {
    R = 80
  } else if (loc.includes('central avenue') || loc.includes('station road') || loc.includes('aundh')) {
    R = 68
  } else {
    R = 48
  }

  // 5. Citizen Reports C (0 - 100)
  // Scaled from upvotes (e.g. 50+ -> 95, 30+ -> 82, 15+ -> 65, <10 -> 40)
  let C = Math.min(98, Math.max(30, Math.round(upvotes * 1.6 + 25)))

  // Calculate weighted contributions
  const w1S = S * SRPS_DEMO_WEIGHTS.S
  const w2T = T * SRPS_DEMO_WEIGHTS.T
  const w3L = L * SRPS_DEMO_WEIGHTS.L
  const w4R = R * SRPS_DEMO_WEIGHTS.R
  const w5C = C * SRPS_DEMO_WEIGHTS.C

  const rawSRPS = w1S + w2T + w3L + w4R + w5C
  const calculatedSRPS = Math.round(rawSRPS * 10) / 10

  // Priority Level classification
  let priorityLevel = 'Low'
  if (calculatedSRPS >= 85) priorityLevel = 'Critical'
  else if (calculatedSRPS >= 70) priorityLevel = 'High'
  else if (calculatedSRPS >= 50) priorityLevel = 'Medium'

  return {
    S,
    T,
    L,
    R,
    C,
    contributions: {
      w1S: Math.round(w1S * 10) / 10,
      w2T: Math.round(w2T * 10) / 10,
      w3L: Math.round(w3L * 10) / 10,
      w4R: Math.round(w4R * 10) / 10,
      w5C: Math.round(w5C * 10) / 10,
    },
    srps: calculatedSRPS,
    displaySRPS: Math.round(calculatedSRPS),
    priorityLevel,
  }
}
