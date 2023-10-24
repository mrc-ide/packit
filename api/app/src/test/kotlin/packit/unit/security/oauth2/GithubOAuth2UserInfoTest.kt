package packit.unit.security.oauth2

import org.junit.jupiter.api.Test
import packit.security.oauth2.GithubOAuth2UserInfo
import kotlin.test.assertEquals

class GithubOAuth2UserInfoTest
{
    @Test
    fun `can get github profile attributes`()
    {
        val email = "test@email.com"
        val name = "testUser"
        val id = "123"

        val attributes = mutableMapOf<String, Any>("id" to id, "name" to name, "email" to email)

        val userInfo = GithubOAuth2UserInfo(attributes)

        assertEquals(userInfo.id(), id)
        assertEquals(userInfo.name(), name)
        assertEquals(userInfo.email(), email)
    }
}
