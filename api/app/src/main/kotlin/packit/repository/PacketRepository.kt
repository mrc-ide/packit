package packit.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import packit.model.IPacketIdCountsDTO
import packit.model.Packet

@Repository
interface PacketRepository : JpaRepository<Packet, String>
{
    @Query("select p.id from Packet p order by p.id asc")
    fun findAllIds(): List<String>
    fun findTopByOrderByTimeDesc(): Packet?

//    @Query("select p.name as name, count(p.id) as nameCount from Packet p group by p.name order by MAX(p.time) desc")
//    fun findCountsByName(pageable: Pageable): Page<IPacketNameCount>

    @Query(
        value = "SELECT " +
                "    name as name, " +
                "    time as latestTime, " +
                "    id AS latestId, " +
                "    id_count as nameCount  " +
                "FROM ( " +
                "    SELECT " +
                "        name, " +
                "        time, " +
                "        id,     " +
                "        ROW_NUMBER() OVER (PARTITION BY name ORDER BY time DESC) AS row_num, " +
                "        COUNT(id) OVER (PARTITION BY name) AS id_count " +
                "    FROM packet " +
                ") as RankedData " +
                "WHERE row_num = 1 AND LOWER(name) LIKE %?1% " +
                "ORDER BY TIME DESC",
        countQuery = "SELECT count(distinct name) from Packet",
        nativeQuery = true
    )
    fun findIdCountDataByName(filterName: String, pageable: Pageable): Page<IPacketIdCountsDTO>
}

