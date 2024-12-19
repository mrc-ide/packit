package packit.repository

import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.security.access.prepost.PostFilter
import org.springframework.stereotype.Repository
import packit.model.PacketGroup
import packit.model.dto.PacketGroupSummary

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int>
{
    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    fun findByNameIn(names: List<String>): List<PacketGroup>

    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    fun findAllByNameContaining(name: String, sort: Sort): List<PacketGroup>

    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    @Query(
        value = """
            WITH RankedPackets AS (SELECT id,
                                          name,
                                          display_name,
                                          description,
                                          start_time,
                                          ROW_NUMBER() OVER (PARTITION BY name ORDER BY start_time DESC) AS rank,
                                          COUNT(id) OVER (PARTITION BY name)                             AS packetCount
                                   FROM packet)
            SELECT pg.id           AS packetGroupId,
                   rp.name,
                   rp.display_name AS latestDisplayName,
                   rp.description  AS latestDescription,
                   rp.start_time   AS latestStartTime,
                   rp.packetCount,
                   rp.id           AS latestPacketId
            FROM RankedPackets rp
                     JOIN packet_group pg ON rp.name = pg.name
            WHERE rp.rank = 1 AND (rp.name ILIKE %?1% OR rp.display_name ILIKE %?1%)
            ORDER BY latestStartTime DESC;
        """,
        nativeQuery = true
    )
    fun getFilteredPacketGroupSummaries(filter: String): List<PacketGroupSummary>
}