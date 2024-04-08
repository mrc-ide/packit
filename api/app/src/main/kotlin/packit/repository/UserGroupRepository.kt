package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.UserGroup
import packit.security.Role

@Repository
interface UserGroupRepository : JpaRepository<UserGroup, Int>
{
    fun findByRole(role: Role): UserGroup?
}