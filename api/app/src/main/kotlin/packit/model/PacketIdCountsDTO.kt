package packit.model

// Projection class for PacketRepository.findIdCountDataByName
interface IPacketIdCountsDTO
{
    fun getName(): String
    fun getNameCount(): Int
    fun getLatestId(): String
    fun getLatestTime(): Long

}

