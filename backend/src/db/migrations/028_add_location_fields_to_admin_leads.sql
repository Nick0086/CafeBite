-- @up
ALTER TABLE admin_leads
ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER google_maps_url,
ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude,
ADD COLUMN place_source VARCHAR(50) DEFAULT 'manual' AFTER longitude,
ADD COLUMN osm_id VARCHAR(100) NULL AFTER place_source,
ADD INDEX idx_admin_leads_lat_lng (latitude, longitude),
ADD INDEX idx_admin_leads_osm_id (osm_id);

-- @down
ALTER TABLE admin_leads
DROP INDEX idx_admin_leads_lat_lng,
DROP INDEX idx_admin_leads_osm_id,
DROP COLUMN latitude,
DROP COLUMN longitude,
DROP COLUMN place_source,
DROP COLUMN osm_id;
