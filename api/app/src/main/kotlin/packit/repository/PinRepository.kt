package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.security.access.prepost.PostFilter
import packit.model.Pin
import java.util.UUID

interface PinRepository : JpaRepository<Pin, UUID> {
    @PostFilter("@authz.canReadPacket(#root, filterObject.packetId)")
    override fun findAll(): List<Pin>
}