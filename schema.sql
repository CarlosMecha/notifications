
-- SQLite notification schema.

CREATE TABLE notifications(
    uuid TEXT NOT NULL PRIMARY KEY,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIME,
    topic TEXT NOT NULL,
    payload TEXT
);

CREATE INDEX notifications_index ON notifications (uuid, timestamp, topic);

