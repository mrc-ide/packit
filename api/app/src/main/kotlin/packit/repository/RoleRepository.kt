package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.Role

@Repository
interface RoleRepository : JpaRepository<Role, Int>
{
    fun findByName(name: String): Role?
    fun existsByName(name: String): Boolean
    fun findByNameIn(names: List<String>): List<Role>

}
