package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.Packet

@Repository
interface PacketRepository : JpaRepository<Packet, String>
