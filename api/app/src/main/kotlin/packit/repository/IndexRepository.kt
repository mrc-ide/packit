package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.Packet

@Repository
interface IndexRepository: JpaRepository<Packet, Long>