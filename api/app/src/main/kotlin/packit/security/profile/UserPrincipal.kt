package packit.security.profile

import org.springframework.security.core.GrantedAuthority

data class UserPrincipal(
    val name: String,
    val displayName: String?,
    val authorities: MutableCollection<out GrantedAuthority>,
    val attributes: MutableMap<String, Any>
)