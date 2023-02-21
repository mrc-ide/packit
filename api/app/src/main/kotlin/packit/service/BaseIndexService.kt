package packit.service

import org.springframework.stereotype.Service
import packit.model.Packet
import packit.repository.IndexRepository


interface IndexService
{
    fun getPackets(): List<Packet>
}

@Service
class BaseIndexService(private val indexRepository: IndexRepository) : IndexService
{
    override fun getPackets(): List<Packet>
    {
        return indexRepository.findAll()
    }
}
