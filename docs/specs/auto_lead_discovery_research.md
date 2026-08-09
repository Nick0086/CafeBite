# Research & Technical Specification: Automated Map Lead Discovery & De-duplication System

## 1. Problem Statement & Objectives
Finding restaurant and cafe leads manually from map applications (e.g. Google Maps) and manually entering them into the CafeBite CRM is tedious, slow, and prone to duplicate entries. 

The goal of this feature is to provide an **Automated Map Lead Discovery & Verification Engine** within CafeBite Admin CRM that:
1. Accepts a location name or map point + radius (e.g. 100m, 500m, 1km, 5km).
2. Automatically queries surrounding restaurants, cafes, fast food outlets, and bakeries using **free map APIs & open-source libraries** (Overpass API / OpenStreetMap).
3. Cross-checks discovered POIs against the existing `admin_leads` database using **spatial distance (Haversine) + string similarity algorithms (Jaro-Winkler / Levenshtein)** to identify duplicates.
4. Allows one-click bulk import of verified new leads into the CRM pipeline.

---

## 2. Primary Sources & Service Comparison

| Component | Technology / Service | Source / Reference | Cost & Rate Limits | Primary Role |
| :--- | :--- | :--- | :--- | :--- |
| **POIs Search API** | Overpass API (OpenStreetMap) | [Overpass API Docs](https://wiki.openstreetmap.org/wiki/Overpass_API) | **100% Free**. No API Key required. Fair usage policy (~10k queries/day). | Searches POIs within radius `around:radius,lat,lng["amenity"~"restaurant\|cafe\|fast_food\|bakery\|bar\|pub"]`. |
| **Geocoding API** | Nominatim API (OpenStreetMap) | [Nominatim Docs](https://nominatim.org/release-docs/latest/api/Search/) | **100% Free**. No API Key required. 1 request/sec rate limit. | Converts location query (e.g., "Navrangpura, Ahmedabad") into Lat/Lng coordinates. |
| **Map Rendering** | Leaflet.js & OpenStreetMap Tiles | [Leafletjs.com](https://leafletjs.com/) | **100% Free** (MIT License). OpenStreetMap tile server standard policy. | Renders interactive radius selector map in frontend modal UI. |
| **Duplicate Verification** | Haversine + Jaro-Winkler | Custom Node.js Module | **100% Free** (Runs in-memory on backend server). | Calculates geographic proximity distance and string similarity score to flag existing CRM leads. |

---

## 3. Detailed Technical Architecture

### 3.1 Overpass API Query Design
To retrieve all food & beverage businesses within a specified radius (in meters) around a coordinate `(lat, lng)`:

```overpass
[out:json][timeout:25];
(
  node["amenity"~"restaurant|cafe|fast_food|bakery|food_court|bar|pub"](around:RADIUS, LAT, LNG);
  way["amenity"~"restaurant|cafe|fast_food|bakery|food_court|bar|pub"](around:RADIUS, LAT, LNG);
);
out center body;
```

#### Fields Extracted from OSM Response:
- `name`: Restaurant/Cafe Name
- `tags.phone` / `tags.contact:phone`: Phone Number
- `tags.website` / `tags.url`: Website / Social Media Link
- `tags.addr:street`, `tags.addr:suburb`, `tags.addr:city`: Structured Address
- `tags.cuisine`: Cuisine type (e.g. indian, Italian, coffee_shop)
- `tags.opening_hours`: Business Operating Hours
- `lat`, `lon`: Coordinates

---

### 3.2 Multi-Tier De-Duplication Logic

```typescript
interface DiscoveredLead {
  osm_id: string;
  name: string;
  phone?: string;
  address?: string;
  city: string;
  lat: number;
  lng: number;
  website?: string;
}

interface DuplicateCheckResult {
  lead: DiscoveredLead;
  status: 'NEW' | 'DUPLICATE' | 'POSSIBLE_DUPLICATE';
  matchScore: number; // 0 to 100
  matchedLeadId?: string;
  matchedReason?: string;
}
```

#### Verification Rules:
1. **Rule A (Phone Exact Match - 100% Match Score)**:
   $$\text{PhoneMatch} \iff \text{normalizePhone}(\text{discovered.phone}) == \text{normalizePhone}(\text{existing.phone})$$
2. **Rule B (Proximity + Fuzzy Name Match - 85% to 95% Match Score)**:
   $$\text{Distance} = \text{Haversine}(\text{lat}_1, \text{lng}_1, \text{lat}_2, \text{lng}_2) \le 50\text{m}$$
   $$\text{NameSimilarity} = \text{JaroWinkler}(\text{discovered.name}, \text{existing.name}) \ge 0.75$$
3. **Rule C (City + Standardized Name Match - 75% to 85% Match Score)**:
   $$\text{city}_1 == \text{city}_2 \land \text{cleanName}(\text{name}_1) == \text{cleanName}(\text{name}_2)$$

---

## 4. Proposed Database Schema Updates

Add spatial & source metadata fields to `admin_leads` table:

```sql
ALTER TABLE admin_leads
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER google_maps_url,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude,
ADD COLUMN place_source VARCHAR(50) DEFAULT 'manual' AFTER longitude,
ADD COLUMN osm_id VARCHAR(100) NULL AFTER place_source,
ADD INDEX idx_admin_leads_lat_lng (latitude, longitude),
ADD INDEX idx_admin_leads_osm_id (osm_id);
```

---

## 5. API Endpoints Specification

### 1. Discover Leads by Radius
- **Endpoint**: `POST /api/v1/admin/leads/discover`
- **Auth**: Admin JWT token
- **Body**:
  ```json
  {
    "locationQuery": "Navrangpura, Ahmedabad",
    "lat": 23.0333,
    "lng": 72.5647,
    "radiusMeters": 500
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "center": { "lat": 23.0333, "lng": 72.5647 },
      "radiusMeters": 500,
      "totalDiscovered": 18,
      "newCount": 14,
      "duplicateCount": 4,
      "leads": [
        {
          "osm_id": "node/12345678",
          "restaurant_name": "Sankalp Restaurant",
          "contact_person": "",
          "phone": "+91 98250 99999",
          "address": "CG Road, Navrangpura",
          "city": "Ahmedabad",
          "lat": 23.0340,
          "lng": 72.5650,
          "duplicateStatus": "DUPLICATE",
          "matchScore": 100,
          "matchReason": "Phone match with existing CRM lead LEAD_1001"
        }
      ]
    }
  }
  ```

### 2. Bulk Import Discovered Leads
- **Endpoint**: `POST /api/v1/admin/leads/bulk-import`
- **Auth**: Admin JWT token
- **Body**:
  ```json
  {
    "leads": [
      {
        "restaurant_name": "Mocha Cafe & Bar",
        "phone": "+91 97000 11111",
        "address": "Gulbai Tekra",
        "city": "Ahmedabad",
        "google_maps_url": "https://maps.google.com/?q=23.0311,72.5611",
        "latitude": 23.0311,
        "longitude": 72.5611,
        "place_source": "osm",
        "osm_id": "node/98765432"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully imported 12 leads into CRM",
    "importedCount": 12
  }
  ```

---

## 6. Frontend UI Mockup & Workflow

In `frontend/src/components/Admin/Leads/AdminLeadsIndex.jsx`:
1. Header action button added: **`Auto-Discover Leads (AI & Map)`**.
2. Clicking opens `AdminLeadDiscoveryModal`:
   - **Search Header**: Address auto-complete or direct map pin drop.
   - **Radius Controls**: Quick buttons (`100m`, `500m`, `1km`, `5km`).
   - **Interactive Map**: Displays target scanning circle overlay and markers.
   - **Candidate Grid**:
     - Filter tabs: `All (18)`, `New Leads (14)`, `Duplicates (4)`.
     - Checkbox selection with "Select All New".
     - Badge tags: `[NEW LEAD]`, `[EXISTING CRM LEAD]`, `[POSSIBLE DUPLICATE]`.
   - **Import Footer**: `Import Selected Leads (14)` button.

---

## 7. Next Steps & Execution Plan
Upon user approval of the Implementation Plan:
1. Create backend service `admin-lead-discovery.service.js` with Overpass API integration & de-duplication rules.
2. Add migration for spatial columns (`latitude`, `longitude`, `osm_id`).
3. Add backend endpoints `/discover` and `/bulk-import`.
4. Build React modal `AdminLeadDiscoveryModal.jsx` using Leaflet / Lucide icons and integrate into `AdminLeadsIndex.jsx`.
5. Run verification tests & deliver walkthrough.
