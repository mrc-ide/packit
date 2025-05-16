package packit.unit.security.profile

import com.auth0.jwt.interfaces.Claim
import com.auth0.jwt.interfaces.DecodedJWT
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import packit.exceptions.PackitException
import packit.model.User
import packit.security.profile.TokenToPrincipalConverter
import packit.security.profile.UserPrincipal
import packit.service.RoleService
import packit.service.UserService
import kotlin.test.assertEquals

class TokenToPrincipalConverterTest
{
    private val roleService = mock<RoleService>()
    private val userService = mock<UserService>()
    private val tokenConverter = TokenToPrincipalConverter(userService, roleService)

    @Test
    fun `can extract authorities from jwt claim au`()
    {
        val mockClaim = mock<Claim> {
            on { isNull } doReturn true
        }

        val result = tokenConverter.extractAuthorities(mockClaim)

        assertEquals(result, mockClaim.asList(SimpleGrantedAuthority::class.java))
    }

    @Test
    fun `returns empty list if null au claim when extracting from token`()
    {
        val mockClaim = mock<Claim> {
            on { isNull } doReturn true
        }

        val result = tokenConverter.extractAuthorities(mockClaim)

        assertEquals(result, mutableListOf<SimpleGrantedAuthority>())
    }

    @Test
    fun `converts jwt to user principal if au present in jwt`()
    {
        val mockNameClaim = mock<Claim> {
            on { asString() } doReturn "fakeName"
            on { isNull } doReturn false
        }
        val mockAuClaim = mock<Claim> {
            on { isMissing } doReturn false
            on { isNull } doReturn false
            on { asList(SimpleGrantedAuthority::class.java) } doReturn mutableListOf(
                SimpleGrantedAuthority("packet.read"), SimpleGrantedAuthority("packet.run")
            )
        }
        val mockDecodedJwt = mock<DecodedJWT> {
            on { getClaim("userName") } doReturn mockNameClaim
            on { getClaim("displayName") } doReturn mockNameClaim
            on { getClaim("au") } doReturn mockAuClaim
        }

        val userPrincipal = UserPrincipal(
            "fakeName",
            "fakeName",
            mutableListOf(
                SimpleGrantedAuthority("packet.read"),
                SimpleGrantedAuthority("packet.run")
            ),
            mutableMapOf()
        )

        val result = tokenConverter.convert(mockDecodedJwt)

        assertEquals(result.name, userPrincipal.name)
        assertEquals(result.displayName, userPrincipal.displayName)
        assertEquals(result.authorities, userPrincipal.authorities)
    }

    @Test
    fun `throws error when username claim is missing`()
    {
        val mockDecodedJwt = mock<DecodedJWT> {
            on { getClaim("userName") } doReturn mock<Claim>()
        }

        assertThrows<PackitException> {
            tokenConverter.convert(mockDecodedJwt)
        }.apply {

            assertEquals(key, "userNameClaimNotInJwt")
            assertEquals(httpStatus, HttpStatus.UNAUTHORIZED)
        }
    }

    @Test
    fun `getAuthorities throws exception when user not found`()
    {
        val mockClaim = mock<Claim> {
            on { isMissing } doReturn true
        }
        assertThrows<PackitException> {
            tokenConverter.getAuthorities(mockClaim, "testUser")
        }.apply {
            assertEquals(key, "userNotFound")
            assertEquals(httpStatus, HttpStatus.UNAUTHORIZED)
        }
    }

    @Test
    fun `getAuthorities returns returns authorities when missing au claim`()
    {
        val mockClaim = mock<Claim> {
            on { isMissing } doReturn true
        }
        val mockUser = mock<User>()
        val authorities: MutableSet<GrantedAuthority> =
            mutableSetOf(SimpleGrantedAuthority("packet.read"))

        whenever(userService.getByUsername("testUser")).doReturn(mockUser)
        whenever(roleService.getGrantedAuthorities(mockUser.roles)).doReturn(authorities)

        val result = tokenConverter.getAuthorities(mockClaim, "testUser")

        assertEquals(result, authorities)
    }
}
