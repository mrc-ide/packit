package packit.security.profile

import org.springframework.security.core.GrantedAuthority

data class UserPrincipal(
    val name: String,
    val displayName: String?,
    val authorities: Collection<GrantedAuthority>
)
