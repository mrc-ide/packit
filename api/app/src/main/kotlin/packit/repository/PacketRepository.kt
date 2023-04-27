package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import packit.model.Packet

@Repository
interface PacketRepository: JpaRepository<Packet, String>
{
    @Query("select p.id from Packet p")
    fun findAllIds(): List<String>
}
