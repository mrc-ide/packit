package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Role
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.repository.UserRepository
import java.time.Instant

interface UserService
{
    fun saveUserFromGithub(username: String, displayName: String?, email: String?): User
    fun createBasicUser(createBasicUser: CreateBasicUser)
    fun updateUserLastLoggedIn(user: User, lastLoggedIn: Instant): User
    fun getUserForLogin(username: String): User
    fun addRolesToUser(username: String, roleNames: List<String>)
    fun removeRolesFromUser(username: String, roleNames: List<String>)
}

@Service
class BaseUserService(
    private val userRepository: UserRepository,
    private val roleService: RoleService,
    private val passwordEncoder: PasswordEncoder
) : UserService
{
    override fun saveUserFromGithub(username: String, displayName: String?, email: String?): User
    {
        val user = userRepository.findByUsername(username)
        if (user != null)
        {
            return updateUserLastLoggedIn(user, Instant.now())
        }
        val usersRole = roleService.getUsernameRole(username)
        val newUser = User(
            username = username,
            displayName = displayName,
            disabled = false,
            email = email,
            userSource = "github",
            lastLoggedIn = Instant.now(),
            roles = mutableListOf(usersRole),
        )
        userRepository.save(newUser)

        return newUser
    }

    override fun createBasicUser(createBasicUser: CreateBasicUser)
    {
        if (userRepository.existsByUsername(createBasicUser.email))
        {
            throw PackitException("userAlreadyExists", HttpStatus.BAD_REQUEST)
        }

        val matchingRoles = roleService.checkMatchingRoles(createBasicUser.userRoles).toMutableList()
        val newUser = User(
            username = createBasicUser.email,
            displayName = createBasicUser.displayName,
            disabled = false,
            email = createBasicUser.email,
            userSource = "basic",
            roles = matchingRoles.apply { add(roleService.getUsernameRole(createBasicUser.email)) },
            password = passwordEncoder.encode(createBasicUser.password)
        )
        userRepository.save(newUser)
    }

    override fun updateUserLastLoggedIn(user: User, lastLoggedIn: Instant): User
    {
        user.lastLoggedIn = lastLoggedIn
        return userRepository.save(user)
    }

    override fun getUserForLogin(username: String): User
    {
        val user =
            userRepository.findByUsername(username) ?: throw PackitException("userNotFound", HttpStatus.UNAUTHORIZED)
        return updateUserLastLoggedIn(user, Instant.now())
    }

    override fun addRolesToUser(username: String, roleNames: List<String>)
    {
        val (user, rolesToAdd) = getUserAndRolesForUpdate(username, roleNames)
        if (rolesToAdd.any { user.roles.contains(it) })
        {
            throw PackitException("userRoleExists", HttpStatus.BAD_REQUEST)
        }

        user.roles.addAll(rolesToAdd)
        userRepository.save(user)
    }

    override fun removeRolesFromUser(username: String, roleNames: List<String>)
    {
        val (user, rolesToRemove) = getUserAndRolesForUpdate(username, roleNames)

        val matchedRolesToRemove = rolesToRemove.map { roleToRemove ->
            val matchedPermission = user.roles.find { roleToRemove == it }
                ?: throw PackitException("userRoleNotExists", HttpStatus.BAD_REQUEST)
            matchedPermission
        }

        user.roles.removeAll(matchedRolesToRemove)
        userRepository.save(user)
    }

    internal fun getUserAndRolesForUpdate(username: String, roleNames: List<String>): Pair<User, List<Role>>
    {
        val user = userRepository.findByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)
        val roles = roleService.getRolesByRoleNames(roleNames)
        if (roles.any { it.isUsername })
        {
            throw PackitException("cannotUpdateUsernameRoles", HttpStatus.BAD_REQUEST)
        }

        return Pair(user, roles)
    }
}
