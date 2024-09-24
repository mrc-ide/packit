package packit.service

import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import packit.exceptions.PackitAuthenticationException
import packit.exceptions.PackitException
import packit.model.User
import packit.model.dto.CreateBasicUser
import packit.model.dto.UpdatePassword
import packit.repository.UserRepository
import packit.security.profile.UserPrincipal
import java.time.Instant
import javax.naming.AuthenticationException

interface UserService
{
    fun saveUserFromGithub(username: String, displayName: String?, email: String?): User
    fun createBasicUser(createBasicUser: CreateBasicUser): User
    fun getUserForBasicLogin(username: String): User
    fun deleteUser(username: String)
    fun getUsersByUsernames(usernames: List<String>): List<User>
    fun getByUsername(username: String): User?
    fun saveUser(user: User): User
    fun saveUsers(users: List<User>): List<User>
    fun updatePassword(username: String, updatePassword: UpdatePassword)
    fun checkAndUpdateLastLoggedIn(username: String)
    fun getServiceUser(): User
    fun getUserPrincipal(user: User): UserPrincipal
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
            if (user.userSource != "github") {
                throw PackitException("userAlreadyExists", HttpStatus.BAD_REQUEST)
            }
            return updateUserLastLoggedIn(user, Instant.now())
        }

        val roles = roleService.getDefaultRoles().toMutableList()
        roles.add(roleService.createUsernameRole(username))

        val newUser = User(
            username = username,
            displayName = displayName,
            disabled = false,
            email = email,
            userSource = "github",
            lastLoggedIn = Instant.now(),
            roles = roles,
        )
        userRepository.save(newUser)

        return newUser
    }

    override fun createBasicUser(createBasicUser: CreateBasicUser): User
    {
        if (userRepository.existsByUsername(createBasicUser.email))
        {
            throw PackitException("userAlreadyExists", HttpStatus.BAD_REQUEST)
        }

        val roles = roleService.getDefaultRoles().toMutableList()
        roles.addAll(roleService.getRolesByRoleNames(createBasicUser.userRoles).toMutableList())
        roles.add(roleService.createUsernameRole(createBasicUser.email))

        val newUser = User(
            username = createBasicUser.email,
            displayName = createBasicUser.displayName,
            disabled = false,
            email = createBasicUser.email,
            userSource = "basic",
            roles = roles,
            password = passwordEncoder.encode(createBasicUser.password)
        )
        return userRepository.save(newUser)
    }

    internal fun updateUserLastLoggedIn(user: User, lastLoggedIn: Instant): User
    {
        user.lastLoggedIn = lastLoggedIn
        return userRepository.save(user)
    }

    override fun getUserForBasicLogin(username: String): User
    {
        return userRepository.findByUsernameAndUserSource(username, "basic") ?: throw AuthenticationException()
    }

    override fun getUsersByUsernames(usernames: List<String>): List<User>
    {
        val foundUsers = userRepository.findByUsernameIn(usernames)

        if (foundUsers.size != usernames.toSet().size)
        {
            throw PackitException("invalidUsersProvided", HttpStatus.BAD_REQUEST)
        }
        return foundUsers
    }

    override fun getByUsername(username: String): User?
    {
        return userRepository.findByUsername(username)
    }

    override fun saveUser(user: User): User
    {
        return userRepository.save(user)
    }

    override fun saveUsers(users: List<User>): List<User>
    {
        return userRepository.saveAll(users)
    }

    override fun updatePassword(username: String, updatePassword: UpdatePassword)
    {
        val user = userRepository.findByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)

        if (!passwordEncoder.matches(updatePassword.currentPassword, user.password))
        {
            throw PackitException("invalidPassword", HttpStatus.BAD_REQUEST)
        }

        user.password = passwordEncoder.encode(updatePassword.newPassword)
        updateUserLastLoggedIn(user, Instant.now())
    }

    override fun checkAndUpdateLastLoggedIn(username: String)
    {
        val user = userRepository.findByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)
        if (user.lastLoggedIn == null)
        {
            throw PackitAuthenticationException("updatePassword", HttpStatus.FORBIDDEN)
        }

        updateUserLastLoggedIn(user, Instant.now())
    }

    override fun deleteUser(username: String)
    {
        val user = userRepository.findByUsername(username)
            ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)

        if (user.userSource == "service") {
            throw PackitException("cannotUpdateServiceUser", HttpStatus.BAD_REQUEST)
        }

        userRepository.delete(user)
        roleService.deleteUsernameRole(username)
    }

    override fun getServiceUser(): User
    {
        return userRepository.findByUsernameAndUserSource("SERVICE", "service")
            ?: throw PackitException("serviceUserNotFound", HttpStatus.INTERNAL_SERVER_ERROR)
    }

    override fun getUserPrincipal(user: User): UserPrincipal {
        return UserPrincipal(
            user.username,
            user.displayName,
            roleService.getGrantedAuthorities(user.roles),
            mutableMapOf()
        )
    }
}
