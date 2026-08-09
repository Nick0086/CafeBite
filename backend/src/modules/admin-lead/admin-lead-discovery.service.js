import * as adminLeadRepository from './admin-lead.repository.js';
import { createUniqueId } from '../../utils/utils.js';
import { HttpError } from '../../utils/errorHelper.js';

// ─── Utility: Haversine distance in meters ───────────────────────────────────
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ─── Utility: Clean and normalize text for string comparison ──────────────────
export function normalizeName(name = '') {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\b(the|restaurant|cafe|dhaba|bites|hotel|food|kitchen|grill|bar|co|pvt|ltd|and|&)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ─── Utility: Jaro-Winkler String Similarity (0.0 to 1.0) ────────────────────
export function jaroWinklerDistance(s1, s2) {
    const a = normalizeName(s1);
    const b = normalizeName(s2);
    if (a === b) return 1.0;
    if (!a || !b) return 0.0;

    let m = 0;
    const len1 = a.length;
    const len2 = b.length;
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;

    const matches1 = new Array(len1).fill(false);
    const matches2 = new Array(len2).fill(false);

    for (let i = 0; i < len1; i++) {
        const start = Math.max(0, i - matchWindow);
        const end = Math.min(i + matchWindow + 1, len2);
        for (let j = start; j < end; j++) {
            if (matches2[j] || a[i] !== b[j]) continue;
            matches1[i] = true;
            matches2[j] = true;
            m++;
            break;
        }
    }

    if (m === 0) return 0.0;

    let k = 0;
    let t = 0;
    for (let i = 0; i < len1; i++) {
        if (!matches1[i]) continue;
        while (!matches2[k]) k++;
        if (a[i] !== b[k]) t++;
        k++;
    }
    t = t / 2;

    const jaro = (m / len1 + m / len2 + (m - t) / m) / 3;

    // Winkler prefix adjustment
    let p = 0.1;
    let l = 0;
    while (l < Math.min(4, Math.min(len1, len2)) && a[l] === b[l]) {
        l++;
    }

    return jaro + l * p * (1 - jaro);
}

// ─── Utility: Normalize Phone Number ─────────────────────────────────────────
export function normalizePhone(phone = '') {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '').slice(-10);
}

// ─── Geocode query using OpenStreetMap Nominatim API ──────────────────────────
export const geocodeLocation = async (query) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'CafeBite-CRM-LeadFinder/1.0 (contact@cafebite.in)',
            },
        });
        if (!res.ok) throw new Error(`Nominatim error: ${res.statusText}`);
        const data = await res.json();
        if (!data || data.length === 0) {
            throw new HttpError(`Location "${query}" could not be geocoded`, 404);
        }
        const item = data[0];
        const city =
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.state_district ||
            query.split(',')[0];
        return {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            city,
            state: item.address?.state || '',
        };
    } catch (err) {
        if (err instanceof HttpError) throw err;
        throw new HttpError(`Geocoding failed: ${err.message}`, 500);
    }
};

// ─── Fetch POIs from Overpass API with multi-server failover ────────────────────
export const fetchOSMPlaces = async (lat, lng, radiusMeters = 500, cityName = '') => {
    const overpassEndpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.private.coffee/api/interpreter',
    ];

    const overpassQuery = `
        [out:json][timeout:15];
        (
          node["amenity"~"restaurant|cafe|fast_food|bakery|food_court|bar|pub"](around:${radiusMeters},${lat},${lng});
          way["amenity"~"restaurant|cafe|fast_food|bakery|food_court|bar|pub"](around:${radiusMeters},${lat},${lng});
        );
        out center body 100;
    `;

    let lastError = null;
    let data = null;

    for (const endpoint of overpassEndpoints) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

            const res = await fetch(endpoint, {
                method: 'POST',
                body: `data=${encodeURIComponent(overpassQuery)}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'CafeBite-CRM-LeadFinder/1.0 (contact@cafebite.in)',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                data = await res.json();
                break; // Successfully retrieved data!
            } else {
                console.warn(`Overpass endpoint ${endpoint} status ${res.status}`);
                lastError = new Error(`Overpass server ${endpoint} status ${res.status}`);
            }
        } catch (err) {
            console.warn(`Overpass endpoint ${endpoint} failed:`, err.message);
            lastError = err;
        }
    }

    if (!data || !data.elements) {
        console.warn('All Overpass API servers timed out or failed:', lastError?.message);
        return [];
    }

    const elements = data.elements || [];

    return elements
        .map((el) => {
            const tags = el.tags || {};
            const name = tags.name || tags['name:en'] || null;
            if (!name) return null; // Skip unnamed POIs

            const itemLat = el.lat || el.center?.lat || null;
            const itemLng = el.lon || el.center?.lon || null;
            const phone = tags.phone || tags['contact:phone'] || tags.mobile || null;
            const website = tags.website || tags['contact:website'] || tags.url || null;
            const cuisine = tags.cuisine || tags.amenity || 'Restaurant';

            // Format address from tags
            const street = tags['addr:street'] || tags['addr:full'] || '';
            const suburb = tags['addr:suburb'] || tags['addr:district'] || '';
            const city = tags['addr:city'] || cityName || '';
            const fullAddress = [street, suburb, city].filter(Boolean).join(', ') || tags['addr:full'] || suburb || city;

            const mapsUrl = itemLat && itemLng
                ? `https://maps.google.com/?q=${itemLat},${itemLng}`
                : website || null;

            return {
                osm_id: `${el.type}/${el.id}`,
                restaurant_name: name,
                contact_person: null,
                phone: phone,
                email: tags.email || tags['contact:email'] || null,
                address: fullAddress,
                city: city || cityName,
                state: tags['addr:state'] || null,
                google_maps_url: mapsUrl,
                latitude: itemLat,
                longitude: itemLng,
                cuisine,
                website,
                place_source: 'osm',
            };
        })
        .filter(Boolean);
};

// ─── Discover & Verify Duplicates Pipeline ────────────────────────────────────
export const discoverLeads = async ({ locationQuery, lat, lng, radiusMeters = 500 }) => {
    let centerLat = lat;
    let centerLng = lng;
    let locationName = locationQuery || '';
    let city = '';
    let state = '';

    // Geocode if lat/lng are missing
    if (!centerLat || !centerLng) {
        if (!locationQuery || !locationQuery.trim()) {
            throw new HttpError('Either locationQuery or (lat, lng) coordinates are required', 400);
        }
        const geo = await geocodeLocation(locationQuery);
        centerLat = geo.lat;
        centerLng = geo.lng;
        locationName = geo.displayName;
        city = geo.city;
        state = geo.state;
    }

    // Fetch places from OSM
    const discoveredList = await fetchOSMPlaces(centerLat, centerLng, radiusMeters, city);

    // Fetch all existing leads from database for duplicate checking
    const existingLeads = await adminLeadRepository.findLeads({ search: '', status: 'all' });

    // Process & score duplicates
    const processedLeads = discoveredList.map((item) => {
        let duplicateStatus = 'NEW';
        let matchScore = 0;
        let matchReason = null;
        let matchedLead = null;

        const itemPhoneNorm = normalizePhone(item.phone);

        for (const existing of existingLeads) {
            const existingPhoneNorm = normalizePhone(existing.phone);
            const distMeters = calculateDistanceMeters(
                item.latitude,
                item.longitude,
                existing.latitude,
                existing.longitude
            );

            // Tier 1: Exact Phone match
            if (itemPhoneNorm && existingPhoneNorm && itemPhoneNorm === existingPhoneNorm) {
                duplicateStatus = 'DUPLICATE';
                matchScore = 100;
                matchReason = `Phone number matches existing lead (${existing.restaurant_name})`;
                matchedLead = existing;
                break;
            }

            // Tier 1: Exact OSM ID match
            if (existing.osm_id && existing.osm_id === item.osm_id) {
                duplicateStatus = 'DUPLICATE';
                matchScore = 100;
                matchReason = `Already imported into CRM (${existing.restaurant_name})`;
                matchedLead = existing;
                break;
            }

            // Tier 2: Spatial Proximity (<50m) + Fuzzy Name Similarity
            const similarity = jaroWinklerDistance(item.restaurant_name, existing.restaurant_name);

            if (distMeters <= 50 && similarity >= 0.70) {
                duplicateStatus = 'DUPLICATE';
                matchScore = Math.round(similarity * 100);
                matchReason = `Located ${Math.round(distMeters)}m away with matching name (${existing.restaurant_name})`;
                matchedLead = existing;
                break;
            }

            // Tier 3: Same Area (<150m) + High Name Match
            if (distMeters <= 150 && similarity >= 0.85) {
                duplicateStatus = 'POSSIBLE_DUPLICATE';
                matchScore = Math.round(similarity * 90);
                matchReason = `Located ${Math.round(distMeters)}m away with similar name (${existing.restaurant_name})`;
                matchedLead = existing;
                break;
            }

            // Tier 4: Same City + High Name Similarity
            if (
                item.city &&
                existing.city &&
                item.city.toLowerCase() === existing.city.toLowerCase() &&
                similarity >= 0.90
            ) {
                duplicateStatus = 'POSSIBLE_DUPLICATE';
                matchScore = 80;
                matchReason = `Matching name in ${existing.city} (${existing.restaurant_name})`;
                matchedLead = existing;
            }
        }

        return {
            ...item,
            duplicateStatus,
            matchScore,
            matchReason,
            matchedLeadId: matchedLead?.unique_id || null,
        };
    });

    const newCount = processedLeads.filter((l) => l.duplicateStatus === 'NEW').length;
    const duplicateCount = processedLeads.filter((l) => l.duplicateStatus !== 'NEW').length;

    return {
        success: true,
        message: `Discovered ${processedLeads.length} places in ${radiusMeters}m radius`,
        data: {
            center: { lat: centerLat, lng: centerLng },
            locationName,
            city,
            state,
            radiusMeters,
            totalDiscovered: processedLeads.length,
            newCount,
            duplicateCount,
            leads: processedLeads,
        },
    };
};

// ─── Bulk Import Discovered Leads into CRM ─────────────────────────────────────
export const bulkImportLeads = async (leadsArray) => {
    if (!Array.isArray(leadsArray) || leadsArray.length === 0) {
        throw new HttpError('Leads array is required and must not be empty', 400);
    }

    let importedCount = 0;
    const importedIds = [];

    for (const item of leadsArray) {
        if (!item.restaurant_name || !item.city) {
            continue; // Skip invalid entries
        }

        const unique_id = createUniqueId('LEAD');
        const phone = item.phone || '+91 00000 00000'; // Default placeholder if missing in OSM

        await adminLeadRepository.createLead({
            unique_id,
            restaurant_name: item.restaurant_name,
            contact_person: item.contact_person || null,
            phone: phone,
            email: item.email || null,
            address: item.address || null,
            city: item.city,
            state: item.state || null,
            google_maps_url: item.google_maps_url || null,
            latitude: item.latitude || null,
            longitude: item.longitude || null,
            place_source: item.place_source || 'osm',
            osm_id: item.osm_id || null,
            status: 'call_needed',
            notes: item.cuisine ? `Discovered via OSM Radar scan. Category/Cuisine: ${item.cuisine}` : 'Discovered via OSM Radar scan.',
        });

        importedCount++;
        importedIds.push(unique_id);
    }

    return {
        status: 'success',
        message: `Successfully imported ${importedCount} leads into CRM pipeline`,
        data: {
            importedCount,
            importedIds,
        },
    };
};
