package packit.repository

import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.security.access.prepost.PostFilter
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import packit.model.Packet

@Repository
interface PacketRepository : JpaRepository<Packet, String> {
    @Query("select p.id from Packet p order by p.id asc")
    fun findAllIds(): List<String>
    fun findTopByOrderByImportTimeDesc(): Packet?

    @PostFilter("@authz.canReadPacket(#root, filterObject)")
    fun findByName(name: String, sort: Sort): List<Packet>

    @PostFilter("@authz.canReadPacket(#root, filterObject)")
    fun findAllByNameContainingAndIdContaining(name: String, id: String, sort: Sort): List<Packet>

    @Transactional
    fun deleteAllByIdIn(ids: Collection<String>)

    @PostFilter("@authz.canReadPacket(#root, filterObject)")
    @Query(
        """
        SELECT p FROM Packet p
        WHERE p.name ILIKE %?1% OR p.displayName ILIKE %?1%
        """
    )
    fun searchByNameOrDisplayName(filterName: String): List<Packet>
}
