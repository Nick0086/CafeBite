-- @up
CREATE INDEX idx_templates_client_unique_id ON templates (client_id, unique_id);

-- @down
DROP INDEX idx_templates_client_unique_id ON templates;
