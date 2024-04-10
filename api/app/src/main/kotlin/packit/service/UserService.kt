package packit.service

import org.springframework.stereotype.Service
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
            return user
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
}
