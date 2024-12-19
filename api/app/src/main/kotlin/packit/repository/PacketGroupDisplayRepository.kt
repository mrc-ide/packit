package packit.repository

import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import packit.model.PacketGroupDisplay

interface PacketGroupDisplayRepository : ViewRepository<PacketGroupDisplay, Int> {
    @PreAuthorize("@authz.canReadPacketGroup(#root, #name)")
    fun findByName(name: String): PacketGroupDisplay?

    @PostFilter("@authz.canReadPacketGroup(#root, filterObject.name)")
    fun findAllByNameContainingOrLatestDisplayNameContaining(
        name: String, latestDisplayName: String
    ): List<PacketGroupDisplay>
}

fun PacketGroupDisplayRepository.findAllBySearchFilter(search: String): List<PacketGroupDisplay> {
    return this.findAllByNameContainingOrLatestDisplayNameContaining(search, search)
}
