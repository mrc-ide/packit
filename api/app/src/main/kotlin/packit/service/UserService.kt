package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.User
import packit.model.UserGroup
import packit.model.CreateBasicUser
import packit.repository.UserGroupRepository
import packit.repository.UserRepository
import packit.security.Role
import java.time.Instant


interface UserService
{
    fun saveUserFromGithub(username: String, displayName: String?, email: String?): User
    fun createBasicUser(createBasicUser: CreateBasicUser)
    fun getUserRoleUserGroup(): UserGroup
    fun getAdminRoleUserGroup(): UserGroup
}

@Service
class BaseUserService(
    private val userRepository: UserRepository,
    private val userGroupRepository: UserGroupRepository,
    private val passwordEncoder: PasswordEncoder
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
        );
        userRepository.save(newUser)

        return newUser
    }

    override fun createBasicUser(createBasicUser: CreateBasicUser)
    {
        val allUserGroups = userGroupRepository.findAll()
        val foundUserRoles = createBasicUser.userRoles.mapNotNull { role -> allUserGroups.find { it.role == role } }
        
        if (foundUserRoles.size != createBasicUser.userRoles.size)
        {
            throw PackitException("Invalid roles provided", HttpStatus.BAD_REQUEST)
        }

        val newUser = User(
            username = createBasicUser.email,
            displayName = createBasicUser.displayName,
            disabled = false,
            email = createBasicUser.email,
            userSource = "basic",
            lastLoggedIn = Instant.now().toString(),
            userGroups = foundUserRoles.toMutableList(),
            password = passwordEncoder.encode(createBasicUser.password)
        );
        userRepository.save(newUser)
    }

    override fun getUserRoleUserGroup() = userGroupRepository.findByRole(Role.USER)!!
    override fun getAdminRoleUserGroup() = userGroupRepository.findByRole(Role.ADMIN)!!

}