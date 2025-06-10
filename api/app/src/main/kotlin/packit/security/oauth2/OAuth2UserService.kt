package packit.security.oauth2

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Component
import packit.clients.GithubUserClient
import packit.exceptions.PackitException
import packit.security.profile.PackitOAuth2User
import packit.service.UserService

@Component
class OAuth2UserService(
    private val githubUserClient: GithubUserClient,
    private val userService: UserService
) : DefaultOAuth2UserService() {
    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User {
        val oAuth2User = super.loadUser(userRequest)

        checkGithubUserMembership(userRequest)

        return processOAuth2User(oAuth2User)
    }

    fun processOAuth2User(oAuth2User: OAuth2User): OAuth2User {
        val githubInfo = GithubOAuth2UserInfo(oAuth2User.attributes)

        if (githubInfo.userName().isEmpty()) {
            throw PackitException("Username not found from Github provider")
        }

        var user = userService.saveUserFromGithub(githubInfo.userName(), githubInfo.displayName(), githubInfo.email())

        return PackitOAuth2User(user)
    }

    fun checkGithubUserMembership(request: OAuth2UserRequest) {
        githubUserClient.authenticate(request.accessToken.tokenValue)
        githubUserClient.checkGithubMembership()
    }
}
