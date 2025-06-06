package packit.unit.provider

import com.auth0.jwt.JWT
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.AppConfig
import packit.model.User
import packit.security.provider.TokenProvider
import packit.security.provider.TokenProviderBuilder
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit

class TokenProviderTest {
    @Test
    fun `builder returns TokenProviderBuilder with correct config and user`() {
        val user = User(
            username = "name",
            displayName = "displayName",
            disabled = false,
            userSource = "basic",
        )

        val provider = TokenProvider(mock())
        val builder = provider.builder(user)

        assertTrue(builder is TokenProviderBuilder)
    }
}

class TokenProviderBuilderTest {
    private val user = User(
        username = "name",
        displayName = "displayName",
        disabled = false,
        userSource = "basic",
    )

    private val config = mock<AppConfig> {
        on { authJWTSecret } doReturn "changesecretkey"
        on { authExpiryDays } doReturn 1
    }

    @Test
    fun `issue creates token with correct claims when no added permissions`() {
        val builder = TokenProviderBuilder(config, user)
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
    fun `issue includes permissions when available`() {

        val builder = TokenProviderBuilder(config, user)
        val permissions = listOf("packet.read", "packet.write")
        val token = builder.withPermissions(permissions).issue()

        val decoded = JWT.decode(token)
        val auClaim = decoded.getClaim("au").asList(String::class.java)
        assertEquals(permissions.toSet(), auClaim.toSet())
    }

    @Test
    fun `withExpiresAt sets expiry when earlier than default`() {
        val builder = TokenProviderBuilder(config, user)
        val earlierExpiry = Instant.now().plus(1, ChronoUnit.HOURS).truncatedTo(ChronoUnit.SECONDS)
        val token = builder.withExpiresAt(earlierExpiry).issue()

        val decoded = JWT.decode(token)

        assertEquals(earlierExpiry.epochSecond, decoded.expiresAt.toInstant().epochSecond)
    }

    @Test
    fun `withExpiresAt is ignored when later than default`() {
        val builder = TokenProviderBuilder(config, user)
        val laterExpiry = Instant.now().plus(30, ChronoUnit.DAYS).truncatedTo(ChronoUnit.SECONDS)
        val token = builder.withExpiresAt(laterExpiry).issue()

        val decoded = JWT.decode(token)

        val expectedExpiry = Instant.now().plus(1, ChronoUnit.DAYS)
        assertEquals(expectedExpiry.epochSecond, decoded.expiresAt.toInstant().epochSecond)
    }

    @Test
    fun `withDuration reduces token lifetime when shorter than default`() {
        val builder = TokenProviderBuilder(config, user)
        val shorterDuration = Duration.ofHours(1)
        val token = builder.withDuration(shorterDuration).issue()

        val decoded = JWT.decode(token)

        val expectedExpiry = decoded.issuedAt.toInstant().plus(shorterDuration)
        assertEquals(expectedExpiry.epochSecond, decoded.expiresAt.toInstant().epochSecond)
    }

    @Test
    fun `withDuration is ignored when longer than default`() {
        val builder = TokenProviderBuilder(config, user)
        val longerDuration = Duration.ofDays(30)
        val token = builder.withDuration(longerDuration).issue()

        val decoded = JWT.decode(token)
        val expectedExpiry = decoded.issuedAt.toInstant().plus(1, ChronoUnit.DAYS)
        assertEquals(expectedExpiry.epochSecond, decoded.expiresAt.toInstant().epochSecond)
    }

    @Test
    fun `withPermissions initializes permissions when null`() {
        val builder = TokenProviderBuilder(config, user)
        val permissions = listOf("packet.read", "packet.write")

        builder.withPermissions(permissions)
        val token = builder.issue()

        val decoded = JWT.decode(token)
        val auClaim = decoded.getClaim("au").asList(String::class.java)
        assertEquals(permissions.toSet(), auClaim.toSet())
    }

    @Test
    fun `withPermissions retains intersection of existing and new permissions`() {
        val builder = TokenProviderBuilder(config, user)
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
    fun `withExpiresAt and withDuration use earliest expiry`() {
        val builder = TokenProviderBuilder(config, user)
        val specificExpiry = Instant.now().plus(3, ChronoUnit.HOURS)
        val shorterDuration = Duration.ofHours(1)

        val token = builder
            .withExpiresAt(specificExpiry)
            .withDuration(shorterDuration)
            .issue()

        val decoded = JWT.decode(token)

        val expectedExpiry = Instant.ofEpochSecond(decoded.issuedAt.time / 1000).plus(shorterDuration)
        assertEquals(expectedExpiry.epochSecond, decoded.expiresAt.toInstant().epochSecond)
    }
}
