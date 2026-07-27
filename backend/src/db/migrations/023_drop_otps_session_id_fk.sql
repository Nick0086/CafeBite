-- @up
ALTER TABLE otps DROP FOREIGN KEY otps_ibfk_1;

-- @down
ALTER TABLE otps ADD CONSTRAINT otps_ibfk_1 FOREIGN KEY (session_id) REFERENCES client_sessions(session_id);
