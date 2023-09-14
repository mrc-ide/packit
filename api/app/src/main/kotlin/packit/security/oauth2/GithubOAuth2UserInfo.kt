package packit.security.oauth2

class GithubOAuth2UserInfo(private val attributes: MutableMap<String, Any>): OAuth2UserInfo
{
    override fun id(): String
    {
        return attributes["id"].toString()
    }

    override fun name(): String
    {
        return attributes["name"].toString()
    }

    override fun email(): String
    {
        return attributes["email"].toString()
    }

    override fun imageUrl(): String
    {
        return attributes["avatar_url"].toString()
    }
}