package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import packit.model.User
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, UUID>
{
    fun findByUsername(username: String): User?

    @Transactional
    fun deleteByEmail(email: String)
    @Transactional
    fun deleteByUsername(username: String)
    fun findByEmail(email: String): User?
    fun findByUsernameAndUserSource(username: String, userSource: String): User?
    fun findByUserSourceNotOrderByUsername(userSource: String): List<User>
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
    fun findByUsernameIn(usernames: List<String>): List<User>
}
