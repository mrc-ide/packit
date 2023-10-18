package packit.security.oauth2

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Component
import packit.exceptions.PackitException
import packit.model.User
import packit.security.Role
import packit.security.profile.UserPrincipal

@Component
class OAuth2UserService : DefaultOAuth2UserService()
{
    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User
    {
        val oAuth2User = super.loadUser(userRequest)

        return processOAuth2User(oAuth2User)
    }

    fun processOAuth2User(oAuth2User: OAuth2User): OAuth2User
    {
        val githubInfo = GithubOAuth2UserInfo(oAuth2User.attributes)

        if (githubInfo.username().isEmpty())
        {
            throw PackitException("Username not found from Github provider")
        }

        // TODO check if user exists, if not, save user email to database

        val user = User(
            1L,
            githubInfo.email(),
            "",
            Role.USER,
            githubInfo.name(),
            oAuth2User.attributes
        )

        return UserPrincipal.create(user, oAuth2User.attributes)
    }
}
