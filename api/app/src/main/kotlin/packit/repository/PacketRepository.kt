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

    /*TODO: move this function to the PacketGroupDisplayRepository so we can use stuff like https://www.baeldung.com/spring-data-derived-queries#similarity-condition-keywords */
    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    @Query(
        value = """
                SELECT 
                    name as name, 
                    latest_start_time as latestTime, 
                    latest_packet_id AS latestId,
                    packet_count as packetCount,
                    latest_display_name as latestDisplayName
                FROM packet_group_display_view
                WHERE (name ILIKE %?1% OR latest_display_name ILIKE %?1%)
         """,
        nativeQuery = true
    )
    fun getFilteredPacketGroupSummaries(filter: String): List<PacketGroupSummary>

    @PostFilter("@authz.canReadPacket(#root, filterObject.id, filterObject.name)")
    fun findAllByNameContainingAndIdContaining(name: String, id: String, sort: Sort): List<Packet>
}
