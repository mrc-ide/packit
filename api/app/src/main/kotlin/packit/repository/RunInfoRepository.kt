package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.RunInfo

@Repository
interface RunInfoRepository : JpaRepository<RunInfo, String>
