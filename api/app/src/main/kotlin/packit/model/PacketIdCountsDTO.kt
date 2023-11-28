package packit.model

// Projection class for PacketRepository.findIdCountDataByName
interface IPacketIdCountsDTO
{
    fun getName(): String
    fun getNameCount(): Int

    fun getLatestId(): String
    fun getLatestTime(): Long

}

data class PacketIdCountsDTO(val name: String, val count: Int, val latestId: String, val latestTime: Long)
