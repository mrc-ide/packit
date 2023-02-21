package packit.service

import org.springframework.stereotype.Service
import packit.data.Packet
import packit.repository.IndexRepository

interface IIndexService
{
    fun getPacket(): List<Packet>
}

@Service
class IndexService(private val indexRepository: IndexRepository) : IIndexService
{
    override fun getPacket(): List<Packet>
    {
        return indexRepository.findAll()
    }
}
