package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import packit.model.Pin
import java.util.UUID

interface PinRepository : JpaRepository<Pin, UUID>
