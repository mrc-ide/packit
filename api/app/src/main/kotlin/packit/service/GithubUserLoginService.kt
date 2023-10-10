package packit.service

import org.springframework.security.oauth2.client.OAuth2AuthorizedClient
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService
import org.springframework.security.oauth2.client.web.reactive.function.client.ServerOAuth2AuthorizedClientExchangeFilterFunction.oauth2AuthorizedClient
import org.springframework.security.oauth2.core.user.OAuth2User
import packit.AppConfig
import packit.exceptions.PackitException
import packit.model.LoginRequest

class GithubUserLoginService(val config: AppConfig) : LoginService, OAuth2UserService<OAuth2UserRequest, OAuth2User>
{
    override fun authenticateAndIssueToken(loginRequest: LoginRequest): Map<String, String>
    {
        if (loginRequest.email.isEmpty() && loginRequest.password.isEmpty())
        {
            throw PackitException("Empty email or Github personal access token")
        }

        //get github orgs and teams

        //


        return emptyMap()
    }


    override fun loadUser(userRequest: OAuth2UserRequest): OAuth2User
    {
        val delegate = DefaultOAuth2UserService()

        val user = delegate.loadUser(userRequest)

        val client = OAuth2AuthorizedClient(userRequest.clientRegistration, user.name, userRequest.accessToken)

        val url = user.getAttribute<String>("organizations_url")
/*
        val orgs: List<Map<String, Any>> = rest
            .get().uri(url)
            .attributes(oauth2AuthorizedClient(client))
            .retrieve()
            .bodyToMono(MutableList::class.java)
            .block()
*/
        println(user)

        TODO("Not yet implemented")
    }

}
