package packit.security.provider

import com.auth0.jwt.JWT
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.springframework.mock.env.MockEnvironment
import packit.AppConfig
import packit.security.profile.UserPrincipal
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.math.abs

class TokenProviderTest
{
    @Test
    fun `builder returns TokenProviderBuilder with correct config and user`()
    {
        val userPrincipal = UserPrincipal(
            "name",
            "displayName",
            mutableListOf(),
            mutableMapOf()
        )

        val provider = TokenProvider(mock())
        val builder = provider.builder(userPrincipal)

        assertTrue(builder is TokenProviderBuilder)
    }
}

class TokenProviderBuilderTest
{
    private val userPrincipal = UserPrincipal(
        "name",
        "displayName",
        mutableListOf(),
        mutableMapOf()
    )
    private val environmentVariables = mapOf(
        "outpack.server.url" to "url",
        "orderly.runner.url" to "url",
        "db.url" to "url",
        "db.user" to "user",
        "db.password" to "password",
        "auth.jwt.secret" to "secret",
        "auth.oauth2.redirect.url" to "redirectUrl",
        "auth.method" to "basic",
        "auth.expiryDays" to "1",
        "auth.enabled" to "true",
        "auth.githubAPIOrg" to "githubAPIOrg",
        "auth.githubAPITeam" to "githubAPITeam",
        "cors.allowedOrigins" to "http://localhost, https://production",
        "packit.defaultRoles" to "ADMIN,USER"
    )
    private val mockEnv = MockEnvironment()

    private lateinit var config: AppConfig

    @BeforeEach
    fun setupEnv()
    {
        environmentVariables.forEach { (key, value) ->
            mockEnv.setProperty(key, value)
        }
        config = AppConfig(mockEnv)
    }


    @Test
    fun `issue creates token with correct claims when no added permissions`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val token = builder.issue()

        // Verify token can be decoded
        val decoded = JWT.decode(token)
        assertEquals(TokenProviderBuilder.TOKEN_ISSUER, decoded.issuer)
        assertEquals(TokenProviderBuilder.TOKEN_AUDIENCE, decoded.audience.first())
        assertEquals("name", decoded.getClaim("userName").asString())
        assertEquals("displayName", decoded.getClaim("displayName").asString())
        assertTrue(decoded.getClaim("au").isMissing)
        assertNotNull(decoded.issuedAt)
        assertNotNull(decoded.expiresAt)
    }

    @Test
    fun `issue includes permissions when available`()
    {

        val builder = TokenProviderBuilder(config, userPrincipal)
        val permissions = listOf("packet.read", "packet.write")
        val token = builder.withPermissions(permissions).issue()

        val decoded = JWT.decode(token)
        val auClaim = decoded.getClaim("au").asList(String::class.java)
        assertEquals(permissions.toSet(), auClaim.toSet())
    }

    @Test
    fun `withExpiresAt sets expiry when earlier than default`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val earlierExpiry = Instant.now().plus(1, ChronoUnit.HOURS)
        val token = builder.withExpiresAt(earlierExpiry).issue()

        val decoded = JWT.decode(token)
        // Allow 1 second tolerance for test execution time
        assertTrue(abs(earlierExpiry.epochSecond - decoded.expiresAt.toInstant().epochSecond) <= 1)
    }

    @Test
    fun `withExpiresAt is ignored when later than default`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val laterExpiry = Instant.now().plus(30, ChronoUnit.DAYS)
        val token = builder.withExpiresAt(laterExpiry).issue()

        val decoded = JWT.decode(token)
        val expectedExpiry = Instant.now().plus(1, ChronoUnit.DAYS)
        // Ensure expiry is closer to default (1 day) than to requested 30 days
        assertTrue(abs(expectedExpiry.epochSecond - decoded.expiresAt.toInstant().epochSecond) < 3600)
    }

    @Test
    fun `withDuration reduces token lifetime when shorter than default`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val shorterDuration = Duration.ofHours(1)
        val token = builder.withDuration(shorterDuration).issue()

        val decoded = JWT.decode(token)
        val expectedExpiry = Instant.ofEpochSecond(decoded.issuedAt.time / 1000).plus(shorterDuration)
        // Allow 1 second tolerance for test execution time
        assertTrue(abs(expectedExpiry.epochSecond - decoded.expiresAt.toInstant().epochSecond) <= 1)
    }

    @Test
    fun `withDuration is ignored when longer than default`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val longerDuration = Duration.ofDays(30)
        val token = builder.withDuration(longerDuration).issue()

        val decoded = JWT.decode(token)
        val expectedExpiry = Instant.ofEpochSecond(decoded.issuedAt.time / 1000).plus(1, ChronoUnit.DAYS)
        // Allow 1 second tolerance for test execution time
        assertTrue(abs(expectedExpiry.epochSecond - decoded.expiresAt.toInstant().epochSecond) <= 1)
    }

    @Test
    fun `withPermissions initializes permissions when null`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val permissions = listOf("packet.read", "packet.write")

        builder.withPermissions(permissions)
        val token = builder.issue()

        val decoded = JWT.decode(token)
        val auClaim = decoded.getClaim("au").asList(String::class.java)
        assertEquals(permissions.toSet(), auClaim.toSet())
    }

    @Test
    fun `withPermissions retains intersection of existing and new permissions`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val firstPermissions = listOf("packet.read", "packet.write")
        val secondPermissions = listOf("packet.write", "outpack.read")

        val token = builder
            .withPermissions(firstPermissions)
            .withPermissions(secondPermissions)
            .issue()

        val decoded = JWT.decode(token)
        val auClaim = decoded.getClaim("au").asList(String::class.java)
        assertEquals(setOf("packet.write"), auClaim.toSet())
    }

    @Test
    fun `withExpiresAt and withDuration use earliest expiry`()
    {
        val builder = TokenProviderBuilder(config, userPrincipal)
        val specificExpiry = Instant.now().plus(3, ChronoUnit.HOURS)
        val shorterDuration = Duration.ofHours(1)

        val token = builder
            .withExpiresAt(specificExpiry)
            .withDuration(shorterDuration)
            .issue()

        val decoded = JWT.decode(token)
        val expectedExpiry = Instant.ofEpochSecond(decoded.issuedAt.time / 1000).plus(shorterDuration)
        // Allow 1 second tolerance for test execution time
        assertTrue(abs(expectedExpiry.epochSecond - decoded.expiresAt.toInstant().epochSecond) <= 1)
    }
}