package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.OneTimeJob

@Repository
interface OneTimeJobRepository : JpaRepository<OneTimeJob, Int> {
    fun findByName(name: String): OneTimeJob?
}