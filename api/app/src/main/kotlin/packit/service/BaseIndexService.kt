package packit.service

import org.springframework.stereotype.Service
import packit.model.Packet
import packit.repository.IndexRepository


interface IndexService
{
    fun getPacket(): List<Packet>
}

@Service
class BaseIndexService(private val indexRepository: IndexRepository) : IndexService
{
    override fun getPacket(): List<Packet>
    {
        return indexRepository.findAll()
    }
}
