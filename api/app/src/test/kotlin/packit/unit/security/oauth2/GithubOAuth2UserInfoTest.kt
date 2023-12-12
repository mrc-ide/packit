package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import packit.security.oauth2.GithubOAuth2UserInfo
import kotlin.test.assertEquals

class GithubOAuth2UserInfoTest
{
    @Test
    fun `can get github profile attributes`()
    {
        val login = "testUser"
        val name = "Test User"

        val attributes = mutableMapOf<String, Any>("login" to login, "name" to name)

        val userInfo = GithubOAuth2UserInfo(attributes)

        assertEquals(userInfo.userName(), login)
        assertEquals(userInfo.displayName(), name)
    }
}
