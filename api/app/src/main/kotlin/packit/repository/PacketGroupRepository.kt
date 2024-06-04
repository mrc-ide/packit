package packit.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.PacketGroup

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int>
{
    fun findByNameIn(names: List<String>): List<PacketGroup>
    fun findAllByNameContaining(name: String, pageable: Pageable): Page<PacketGroup>
}
