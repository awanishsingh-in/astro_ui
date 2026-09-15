import type { BirthPlace } from '@/types/user'

/**
 * A small gazetteer, standing in for a geocoding service.
 *
 * Coordinates matter: they are what the chart is calculated from, so the UI
 * shows them back once a place is picked rather than hiding the lookup.
 */
export const places: BirthPlace[] = [
  { label: 'Bilaspur, Chhattisgarh', latitude: 22.0797, longitude: 82.1409, timeZone: 'Asia/Kolkata' },
  { label: 'Mumbai, Maharashtra', latitude: 19.076, longitude: 72.8777, timeZone: 'Asia/Kolkata' },
  { label: 'New Delhi, Delhi NCR', latitude: 28.6139, longitude: 77.209, timeZone: 'Asia/Kolkata' },
  { label: 'Gurugram, Haryana', latitude: 28.4595, longitude: 77.0266, timeZone: 'Asia/Kolkata' },
  { label: 'Noida, Uttar Pradesh', latitude: 28.5355, longitude: 77.391, timeZone: 'Asia/Kolkata' },
  { label: 'Bengaluru, Karnataka', latitude: 12.9716, longitude: 77.5946, timeZone: 'Asia/Kolkata' },
  { label: 'Chennai, Tamil Nadu', latitude: 13.0827, longitude: 80.2707, timeZone: 'Asia/Kolkata' },
  { label: 'Kolkata, West Bengal', latitude: 22.5726, longitude: 88.3639, timeZone: 'Asia/Kolkata' },
  { label: 'Hyderabad, Telangana', latitude: 17.385, longitude: 78.4867, timeZone: 'Asia/Kolkata' },
  { label: 'Pune, Maharashtra', latitude: 18.5204, longitude: 73.8567, timeZone: 'Asia/Kolkata' },
  { label: 'Ahmedabad, Gujarat', latitude: 23.0225, longitude: 72.5714, timeZone: 'Asia/Kolkata' },
  { label: 'Jaipur, Rajasthan', latitude: 26.9124, longitude: 75.7873, timeZone: 'Asia/Kolkata' },
  { label: 'Lucknow, Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, timeZone: 'Asia/Kolkata' },
  { label: 'Bhopal, Madhya Pradesh', latitude: 23.2599, longitude: 77.4126, timeZone: 'Asia/Kolkata' },
  { label: 'Patna, Bihar', latitude: 25.5941, longitude: 85.1376, timeZone: 'Asia/Kolkata' },
  { label: 'Raipur, Chhattisgarh', latitude: 21.2514, longitude: 81.6296, timeZone: 'Asia/Kolkata' },
  { label: 'Nagpur, Maharashtra', latitude: 21.1458, longitude: 79.0882, timeZone: 'Asia/Kolkata' },
  { label: 'Indore, Madhya Pradesh', latitude: 22.7196, longitude: 75.8577, timeZone: 'Asia/Kolkata' },
  { label: 'Kochi, Kerala', latitude: 9.9312, longitude: 76.2673, timeZone: 'Asia/Kolkata' },
  { label: 'Guwahati, Assam', latitude: 26.1445, longitude: 91.7362, timeZone: 'Asia/Kolkata' },
  { label: 'Chandigarh, Punjab', latitude: 30.7333, longitude: 76.7794, timeZone: 'Asia/Kolkata' },
  { label: 'Varanasi, Uttar Pradesh', latitude: 25.3176, longitude: 82.9739, timeZone: 'Asia/Kolkata' },
]

/** Split "City, Region" for list rows. */
export function splitPlaceLabel(label: string): { city: string; region: string | null } {
  const comma = label.indexOf(',')
  if (comma === -1) return { city: label, region: null }
  return {
    city: label.slice(0, comma).trim(),
    region: label.slice(comma + 1).trim() || null,
  }
}

/** Case-insensitive prefix-and-substring match, nearest listed town first. */
export function searchPlaces(query: string, limit = 6): BirthPlace[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const starts: BirthPlace[] = []
  const contains: BirthPlace[] = []

  for (const place of places) {
    const label = place.label.toLowerCase()
    const { city } = splitPlaceLabel(place.label)
    const cityLower = city.toLowerCase()
    if (label.startsWith(q) || cityLower.startsWith(q)) starts.push(place)
    else if (label.includes(q) || cityLower.includes(q)) contains.push(place)
  }

  return [...starts, ...contains].slice(0, limit)
}
