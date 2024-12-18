package packit.repository

import org.springframework.security.access.prepost.PostFilter
import packit.model.PacketGroupDisplay

interface PacketGroupDisplayRepository : ViewRepository<PacketGroupDisplay, String> {
    fun findByName(name: String): PacketGroupDisplay?

    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    fun findAllByNameContainingOrLatestDisplayNameContaining(name: String, latestDisplayName: String): List<PacketGroupDisplay>
}