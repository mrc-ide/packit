package packit.repository

import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.security.access.prepost.PostFilter
import org.springframework.stereotype.Repository
import packit.model.Packet
import packit.model.dto.PacketGroupSummary

@Repository
interface PacketRepository : JpaRepository<Packet, String>
{
    @Query("select p.id from Packet p order by p.id asc")
    fun findAllIds(): List<String>
    fun findTopByOrderByImportTimeDesc(): Packet?

    @PostFilter("@authz.canReadPacket(#root, filterObject.id, filterObject.name)")
    fun findByName(name: String, sort: Sort): List<Packet>

    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    @Query(
        value = """
                SELECT 
                    name as name, 
                    start_time as latestTime, 
                    id AS latestId,
                    id_count as packetCount,
                    display_name as latestDisplayName
                FROM ( 
                    SELECT 
                        name,
                        start_time, 
                        id,
                        display_name,
                        ROW_NUMBER() OVER (PARTITION BY name ORDER BY start_time DESC) AS row_num, 
                        COUNT(id) OVER (PARTITION BY name) AS id_count 
                    FROM packet 
                ) as RankedData
                WHERE row_num = 1 AND (name ILIKE %?1% OR display_name ILIKE %?1%)
                ORDER BY start_time DESC
         """,
        nativeQuery = true
    )
    fun getFilteredPacketGroupSummaries(filter: String): List<PacketGroupSummary>

    @PostFilter("@authz.canReadPacket(#root, filterObject.id, filterObject.name)")
    fun findAllByNameContainingAndIdContaining(name: String, id: String, sort: Sort): List<Packet>
}
