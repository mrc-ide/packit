package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import packit.model.RunInfo

@Repository
interface RunInfoRepository : JpaRepository<RunInfo, String>
{
    fun findByTaskId(taskId: String): RunInfo?
}
