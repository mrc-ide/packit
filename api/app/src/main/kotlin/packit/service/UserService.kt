package packit.service

import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.User
import packit.model.UserGroup
import packit.repository.UserGroupRepository
import packit.repository.UserRepository
import packit.security.Role
import java.time.Instant

interface UserService
{
    fun saveUserFromGithub(username: String, displayName: String?, email: String?): User
    fun getUserRoleUserGroup(): UserGroup
    fun getAdminRoleUserGroup(): UserGroup
    fun updateUserLastLoggedIn(user: User, lastLoggedIn: String): User
    fun getUserForLogin(username: String): User
}

@Service
class BaseUserService(
    private val userRepository: UserRepository,
    private val userGroupRepository: UserGroupRepository
) : UserService
{
    override fun saveUserFromGithub(username: String, displayName: String?, email: String?): User
    {
        val user = userRepository.findByUsername(username)
        if (user != null)
        {
            return updateUserLastLoggedIn(user, Instant.now().toString())
        }

        val userRoleUserGroup = getUserRoleUserGroup()
        val newUser = User(
            username = username,
            displayName = displayName,
            disabled = false,
            email = email,
            userSource = "github",
            lastLoggedIn = Instant.now().toString(),
            userGroups = mutableListOf(userRoleUserGroup),
        )
        userRepository.save(newUser)

        return newUser
    }

    override fun getUserRoleUserGroup() = userGroupRepository.findByRole(Role.USER)!!
    override fun getAdminRoleUserGroup() = userGroupRepository.findByRole(Role.ADMIN)!!
    override fun updateUserLastLoggedIn(user: User, lastLoggedIn: String): User
    {
        user.lastLoggedIn = lastLoggedIn
        return userRepository.save(user)
    }

    override fun getUserForLogin(username: String): User
    {
        val user = userRepository.findByUsername(username) ?: throw PackitException("userNotFound")
        return updateUserLastLoggedIn(user, Instant.now().toString())
    }
}
