package packit.security.oauth2

interface OAuth2UserInfo {
    fun displayName(): String?
    fun userName(): String
    fun email(): String?
}
