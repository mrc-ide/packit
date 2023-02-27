/*
 Populate packet table with dummy data
 */
CREATE TABLE tmp(c TEXT);

COPY tmp FROM '/packit-dummy/packet.json';

INSERT INTO packet SELECT q.* FROM tmp, json_populate_record(null::packet, c::json) AS q;

SELECT * FROM packet;

DROP TABLE tmp;