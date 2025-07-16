package packit.repository

import jakarta.transaction.Transactional
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.security.access.prepost.PostFilter
import org.springframework.stereotype.Repository
import packit.model.PacketGroup

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int> {
    @PostFilter("@authz.canViewPacketGroup(#root, filterObject.name)")
    fun findByNameIn(names: List<String>): List<PacketGroup>

    @PostFilter("@authz.canViewPacketGroup(#root, filterObject.name)")
    fun findAllByNameContaining(name: String, sort: Sort): List<PacketGroup>

    fun findByName(name: String): PacketGroup?

    @Transactional
    fun deleteAllByNameNotIn(names: Collection<String>)

    fun existsByName(name: String): Boolean
}
