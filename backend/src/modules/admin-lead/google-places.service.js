import { HttpError } from '../../utils/errorHelper.js';

export const fetchGooglePlaces = async (lat, lng, radiusMeters = 1000, locationQuery = '', cityName = '') => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    try {
        let url;
        if (locationQuery && !/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(locationQuery.trim())) {
            url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent('restaurants cafes in ' + locationQuery)}&key=${apiKey}`;
        } else {
            url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=restaurant&key=${apiKey}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Google Places API status ${res.status}`);
        const data = await res.json();

        if (!data || !data.results || data.results.length === 0) {
            return [];
        }

        // Map Google Places results to CafeBite Lead format
        return data.results.map((item) => {
            const name = item.name;
            if (!name) return null;

            const itemLat = item.geometry?.location?.lat || lat;
            const itemLng = item.geometry?.location?.lng || lng;
            const address = item.formatted_address || item.vicinity || '';

            const mapsUrl = item.place_id
                ? `https://www.google.com/maps/place/?q=place_id:${item.place_id}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (cityName || ''))}`;

            return {
                osm_id: `google/${item.place_id || item.id}`,
                restaurant_name: name,
                contact_person: null,
                phone: item.formatted_phone_number || item.international_phone_number || null,
                email: null,
                address: address,
                city: cityName || address.split(',').reverse()[2]?.trim() || '',
                state: null,
                google_maps_url: mapsUrl,
                latitude: itemLat,
                longitude: itemLng,
                cuisine: item.types?.[0]?.replace(/_/g, ' ') || 'Restaurant',
                website: item.website || null,
                place_source: 'google',
                rating: item.rating || null,
                user_ratings_total: item.user_ratings_total || null,
            };
        }).filter(Boolean);
    } catch (err) {
        console.warn('Google Places API fetch error:', err.message);
        return null;
    }
};
