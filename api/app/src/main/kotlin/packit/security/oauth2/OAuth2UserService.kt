package packit.security.oauth2

import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.oauth2AuthorizedClient
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2ErrorCodes
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.User
import packit.security.Role
import packit.security.profile.UserPrincipal

@Component
class OAuth2UserService(val clients: ClientRegistrationRepository?, val authz: OAuth2AuthorizedClientRepository?,
    val config: AppConfig
) : DefaultOAuth2UserService()
{
    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User
    {
        val oAuth2User = super.loadUser(userRequest)

        checkGithubUserMembership(userRequest, oAuth2User)

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

    private fun getOAuth2WebClient(): WebClient
    {
        val oauth2 = ServletOAuth2AuthorizedClientExchangeFilterFunction(clients, authz)
        return WebClient.builder()
            .filter(oauth2).build()
    }

    private fun checkGithubUserMembership(request: OAuth2UserRequest, user: OAuth2User)
    {
        val client = OAuth2AuthorizedClient(request.clientRegistration, user.name, request.accessToken)
        val oauth2WebClient = getOAuth2WebClient()

        val url = "${config.authGithubAPIBaseUrl}/user/orgs"
        val orgs = oauth2WebClient
            .get().uri(url)
            .attributes(oauth2AuthorizedClient(client))
            .retrieve()
            .bodyToMono(MutableList::class.java)
            .block()

        val allowedOrgs = config.authGithubAPIOrgs.split(",").toList()

        val inAuthorizedOrg = orgs!= null &&
                orgs.stream().anyMatch{ org: Any? -> org is Map<*, *> && allowedOrgs.contains(org["login"])}

        if (!inAuthorizedOrg) {
            throw OAuth2AuthenticationException(OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN,
                "User is not in allowed organization. Please contact your administrator.", ""))
        }
    }
}
