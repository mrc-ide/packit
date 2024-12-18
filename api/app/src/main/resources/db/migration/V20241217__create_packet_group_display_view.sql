CREATE VIEW packet_group_display_view AS
WITH RankedPackets AS (SELECT id,
                              name,
                              display_name,
                              description,
                              start_time,
                              ROW_NUMBER() OVER (PARTITION BY name ORDER BY start_time DESC) AS rank,
                              COUNT(id) OVER (PARTITION BY name)                             AS packet_count
                       FROM packet)
SELECT pg.id           AS packet_group_id,
       rp.name,
       rp.display_name AS latest_display_name,
       rp.description  AS latest_description,
       rp.start_time   AS latest_start_time,
       rp.packet_count,
       rp.id           AS latest_packet_id
FROM RankedPackets rp
         JOIN packet_group pg ON rp.name = pg.name
WHERE rp.rank = 1;
