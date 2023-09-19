package packit.security.oauth2

interface OAuth2UserInfo
{
    fun id(): String
    fun name(): String
    fun email(): String
}
