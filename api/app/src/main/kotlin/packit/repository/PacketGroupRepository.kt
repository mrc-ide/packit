package packit.repository

import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.security.access.prepost.PostFilter
import org.springframework.stereotype.Repository
import packit.model.PacketGroup

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int>
{
    fun findByNameIn(names: List<String>): List<PacketGroup>

    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    fun findAllByNameContaining(name: String, sort: Sort): List<PacketGroup>
}
