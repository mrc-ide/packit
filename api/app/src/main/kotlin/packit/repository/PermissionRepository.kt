package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.Permission

@Repository
interface PermissionRepository : JpaRepository<Permission, Int> {
    fun findByNameIn(names: List<String>): List<Permission>
    fun findByName(name: String): Permission?
}
