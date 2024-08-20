package packit.repository

import org.springframework.stereotype.Repository
import org.springframework.data.jpa.repository.JpaRepository
import packit.model.RunInfo

@Repository
interface RunInfoRepository : JpaRepository<RunInfo, String>
