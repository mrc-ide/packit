package packit.security.oauth2

class GithubOAuth2UserInfo(private val attributes: MutableMap<String, Any>) : OAuth2UserInfo {
    override fun displayName(): String? {
        return attributes["name"]?.toString()
    }

    override fun userName(): String {
        return attributes["login"].toString()
    }

    override fun email(): String? {
        return attributes["email"]?.toString()
    }
}
