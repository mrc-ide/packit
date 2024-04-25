package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.PacketGroup

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int>
{
}