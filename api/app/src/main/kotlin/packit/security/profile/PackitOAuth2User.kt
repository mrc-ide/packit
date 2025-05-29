package packit.security.profile

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.model.User

class PackitOAuth2User(
    val user: User
) : OAuth2User {
    override fun getAttributes(): Map<String, Any> {
        return mapOf()
    }

    override fun getAuthorities(): Collection<GrantedAuthority> {
        return setOf()
    }

    override fun getName(): String {
        return user.username
    }
}
