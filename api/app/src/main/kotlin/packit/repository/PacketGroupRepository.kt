package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.PacketGroup

@Repository
interface PacketGroupRepository : JpaRepository<PacketGroup, Int>
{
    fun saveAllUnique(packetGroups: List<PacketGroup>)
    {
        val existingPacketGroupNames = findAll().map { it.name }
        val newPacketGroups =
            packetGroups.filter { !existingPacketGroupNames.contains(it.name) }
        saveAll(newPacketGroups)
    }
}