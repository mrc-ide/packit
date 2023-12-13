package packit.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import packit.model.Packet
import packit.model.PacketGroupSummary

@Repository
interface PacketRepository : JpaRepository<Packet, String>
{
    @Query("select p.id from Packet p order by p.id asc")
    fun findAllIds(): List<String>
    fun findTopByOrderByImportTime(): Packet?
    fun findByName(name: String, pageable: Pageable): Page<Packet>

    @Query(
        value = """
                SELECT 
                    name as name, 
                    start_time as latestTime, 
                    id AS latestId, 
                    id_count as packetCount  
                FROM ( 
                    SELECT 
                        name, 
                        start_time, 
                        id,     
                        ROW_NUMBER() OVER (PARTITION BY name ORDER BY start_time DESC) AS row_num, 
                        COUNT(id) OVER (PARTITION BY name) AS id_count 
                    FROM packet 
                ) as RankedData 
                WHERE row_num = 1 AND name ILIKE %?1% 
                ORDER BY start_time DESC
         """,
        countQuery = "SELECT count(distinct name) from packet WHERE name ILIKE  %?1%",
        nativeQuery = true
    )
    fun findPacketGroupSummaryByName(filterName: String, pageable: Pageable): Page<PacketGroupSummary>
}
