package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import packit.model.User
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, UUID>
{
    fun findByUsername(username: String): User?
    fun deleteByEmail(email: String)
    fun findByEmail(email: String): User?
    fun findByUsernameAndUserSource(username: String, userSource: String): User?
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
    fun findByUsernameIn(usernames: List<String>): List<User>
}
