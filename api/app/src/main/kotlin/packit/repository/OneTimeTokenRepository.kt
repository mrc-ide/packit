package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.OneTimeToken
import java.util.UUID

@Repository
interface OneTimeTokenRepository : JpaRepository<OneTimeToken, UUID>