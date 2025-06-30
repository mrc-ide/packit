package packit.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import packit.model.RunInfo

@Repository
interface RunInfoRepository : JpaRepository<RunInfo, String> {
    fun findByTaskId(taskId: String): RunInfo?
    fun findAllByPacketGroupNameContaining(packetGroupName: String, pageable: Pageable): Page<RunInfo>

    @Transactional
    fun deleteAllByPacketGroupName(packetGroupName: String)
    @Transactional
    fun deleteByPacketId(packetId: String)
    fun findByPacketId(packetId: String): RunInfo?
}
