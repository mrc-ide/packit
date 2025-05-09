package packit.repository

import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Repository
import packit.model.PacketGroup

interface PacketIdProjection
{
    val id: String
}

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int>
{
    @PostFilter("@authz.canViewPacketGroup(#root, filterObject.name)")
    fun findByNameIn(names: List<String>): List<PacketGroup>

    @PostFilter("@authz.canViewPacketGroup(#root, filterObject.name)")
    fun findAllByNameContaining(name: String, sort: Sort): List<PacketGroup>

    @PreAuthorize("@authz.canViewPacketGroup(#root, #name)")
    @Query(
        value = """
            SELECT p.id AS id
            FROM packet p
            JOIN packet_group pg ON p.name = pg.name
            WHERE pg.name = ?1
            ORDER BY p.start_time DESC
            LIMIT 1
        """,
        nativeQuery = true
    )
    fun findLatestPacketIdForGroup(name: String): PacketIdProjection?
    fun findByName(name: String): PacketGroup?
}
