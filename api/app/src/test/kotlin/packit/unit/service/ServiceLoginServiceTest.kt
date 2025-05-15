package packit.unit.service
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.SignedJWT
import com.nimbusds.jwt.proc.DefaultJWTProcessor
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtClaimsSet
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.test.web.client.ExpectedCount
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.*
import org.springframework.test.web.client.response.DefaultResponseCreator.*
import org.springframework.test.web.client.response.MockRestResponseCreators.*
import org.springframework.web.client.RestTemplate
import packit.AppConfig
import packit.config.ServiceLoginConfig
import packit.config.ServiceLoginPolicy
import packit.exceptions.PackitException
import packit.model.User
import packit.model.dto.LoginWithToken
import packit.security.profile.UserPrincipal
import packit.security.provider.TokenProvider
import packit.service.ServiceLoginService
import packit.service.UserService
import packit.testing.TestJwtIssuer
import java.time.Duration
import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.test.Test
import kotlin.test.assertEquals

class ServiceLoginServiceTest {
    private val restTemplate = RestTemplate()
    private val server = MockRestServiceServer.bindTo(restTemplate).ignoreExpectOrder(true).build()

    private val serviceUser = User(
        username = "service",
        userSource = "service",
        displayName = null,
        email = null,
        disabled = false,
    )

    private val serviceUserPrincipal = UserPrincipal(
        name = "service",
        displayName = "Service Account",
        authorities = listOf(
            "packet.read",
            "packet.run",
            "outpack.read",
            "outpack.write",
            "user.manage",
        ).map { SimpleGrantedAuthority(it) }.toMutableList(),
        attributes = mutableMapOf(),
    )

    private val mockAppConfig = mock<AppConfig>() {
        on { authJWTSecret } doAnswer { "secret" }
        on { authExpiryDays } doAnswer { 1 }
    }
    private val mockUserService = mock<UserService>() {
        on { getServiceUser() } doAnswer { serviceUser }
        on { getUserPrincipal(serviceUser) } doAnswer { serviceUserPrincipal }
    }

    lateinit var defaultIssuer: TestJwtIssuer

    // Create a TestJwtIssuer and register its JWK set on the mock rest template.
    fun createIssuer(url: String): TestJwtIssuer {
        val issuer = TestJwtIssuer()
        server.expect(ExpectedCount.between(0, Integer.MAX_VALUE), requestTo(url))
              .andExpect(method(HttpMethod.GET))
              .andRespond(withSuccess(issuer.jwkSet.toString(), MediaType.APPLICATION_JSON))
        return issuer
    }

    fun exchangeTokens(config: ServiceLoginConfig, token: String): Jwt {
        val sut = ServiceLoginService(TokenProvider(mockAppConfig), mockUserService, config, restTemplate)
        val result = sut.authenticateAndIssueToken(LoginWithToken(token))

        val processor = object : DefaultJWTProcessor<SecurityContext>() {
            // The default implementation enforces signature verification, but in this
            // testing context we don't care.
            override fun process(jwt: SignedJWT, context: SecurityContext?) = jwt.getJWTClaimsSet()
        }
        return NimbusJwtDecoder(processor).decode(result["token"]!!)
    }

    fun exchangeTokens(config: ServiceLoginConfig, f: (JwtClaimsSet.Builder) -> Unit): Jwt {
        return exchangeTokens(config, defaultIssuer.issue(f))
    }

    @BeforeEach
    fun setup() {
        defaultIssuer = createIssuer("http://issuer/jwks.json")
    }

    @AfterEach
    fun reset() {
        server.reset()
    }

    @Test
    fun `can exchange tokens`() {
        val config = ServiceLoginConfig(
            audience = "packit",
            policies = listOf(ServiceLoginPolicy(jwkSetURI = "http://issuer/jwks.json", issuer = "issuer"))
        )

        exchangeTokens(config, { builder ->
            builder.issuer("issuer")
            builder.audience(listOf("packit"))
        })
    }

    @Test
    fun `provided token must satisfy all required claims`() {
        val requiredIssuer = "issuer"
        val requiredAudience = "packit"
        data class TestCase(
            val providedClaims: Map<String, Any> = mapOf(),
            val providedIssuer: String? = requiredIssuer,
            val providedAudience: List<String>? = listOf(requiredAudience),
            val requiredClaims: Map<String, String> = mapOf(),
            val expectSuccess: Boolean,
        )
        val testCases = listOf(
            TestCase(providedAudience = listOf("packit"), expectSuccess = true),
            TestCase(providedAudience = listOf("packit", "other"), expectSuccess = true),
            TestCase(providedAudience = listOf("other", "packit"), expectSuccess = true),

            TestCase(providedAudience = null, expectSuccess = false),
            TestCase(providedAudience = listOf(), expectSuccess = false),
            TestCase(providedAudience = listOf("other1", "other2"), expectSuccess = false),
            TestCase(providedAudience = listOf("other"), expectSuccess = false),

            TestCase(providedIssuer = "issuer", expectSuccess = true),
            TestCase(providedIssuer = null, expectSuccess = false),
            TestCase(providedIssuer = "wrong-issuer", expectSuccess = false),

            TestCase(
                requiredClaims = mapOf("repository" to "mrc-ide/packit"),
                providedClaims = mapOf("repository" to "mrc-ide/packit"),
                expectSuccess = true,
            ),
            TestCase(
                requiredClaims = mapOf("repository" to "mrc-ide/packit"),
                providedClaims = mapOf("repository" to "mrc-ide/not-packit"),
                expectSuccess = false,
            ),
            TestCase(
                requiredClaims = mapOf("repository" to "mrc-ide/packit"),
                providedClaims = mapOf(),
                expectSuccess = false,
            ),
            TestCase(
                requiredClaims = mapOf("repository" to "mrc-ide/packit"),
                providedClaims = mapOf("repository" to listOf("mrc-ide/not-packit")),
                expectSuccess = false,
            ),
            TestCase(
                requiredClaims = mapOf("owner" to "mrc-ide", "repository" to "packit"),
                providedClaims = mapOf("owner" to "mrc-ide", "repository" to "packit"),
                expectSuccess = true,
            ),
            TestCase(
                requiredClaims = mapOf("owner" to "mrc-ide", "repository" to "packit"),
                providedClaims = mapOf("owner" to "mrc-ide"),
                expectSuccess = false,
            ),
            TestCase(
                requiredClaims = mapOf("owner" to "mrc-ide", "repository" to "packit"),
                providedClaims = mapOf("repository" to "packit"),
                expectSuccess = false,
            ),
        )

        for (entry in testCases) {
            val config = ServiceLoginConfig(
                audience = requiredAudience,
                policies = listOf(
                    ServiceLoginPolicy(
                    jwkSetURI = "http://issuer/jwks.json",
                    issuer = requiredIssuer,
                    requiredClaims = entry.requiredClaims,
                )
                )
            )

            val fn = { builder: JwtClaimsSet.Builder ->
                if (entry.providedIssuer != null) {
                    builder.issuer(entry.providedIssuer)
                }
                if (entry.providedAudience != null) {
                    builder.audience(entry.providedAudience)
                }
                for ((name, value) in entry.providedClaims) {
                    builder.claim(name, value)
                }
            }

            if (entry.expectSuccess) {
                assertDoesNotThrow("$entry") {
                    exchangeTokens(config, fn)
                }
            } else {
                val ex = assertThrows<PackitException>("$entry") {
                    exchangeTokens(config, fn)
                }
                assertEquals(ex.key, "externalJwtTokenInvalid")
                assertEquals(ex.httpStatus, HttpStatus.UNAUTHORIZED)
            }
        }
    }

    @Test
    fun `issued token is granted permissions from the policy`() {
        class TestCase(
            val policyPermissions: List<String>,
            val expectedPermissions: Set<String>,
        )
        val testCases = listOf(
            TestCase(listOf<String>(), setOf<String>()),
            TestCase(listOf("outpack.read"), setOf("outpack.read")),
            TestCase(listOf("outpack.read", "outpack.write"), setOf("outpack.read", "outpack.write")),
            TestCase(listOf("not.a.real.permission"), setOf()),

            // TODO: this currently returns an empty set, because the JwtIssuer doesn't support narrowing permissions
            // from a global permission to a fine-grained one.
            TestCase(listOf("packet.read:packetGroup:packet-name"), setOf())
        )

        for (entry in testCases) {
            val config = ServiceLoginConfig(
                audience = "packit",
                policies = listOf(
                    ServiceLoginPolicy(
                    jwkSetURI = "http://issuer/jwks.json",
                    issuer = "issuer",
                    grantedPermissions = entry.policyPermissions,
                )
                )
            )
            val token = exchangeTokens(config, { builder ->
                builder.issuer("issuer")
                builder.audience(listOf("packit"))
            })
            assertEquals(token.getClaimAsStringList("au").toSet(), entry.expectedPermissions)
        }
    }

    @Test
    fun `issued tokens have duration limited by shortest of application configuration, policy and provided token`() {
        whenever(mockAppConfig.authExpiryDays).thenReturn(7)

        class TestCase(
            val policyDuration: Duration? = null,
            val tokenDuration: Duration? = null,
            val expectedDuration: Duration
        )

        val testCases = listOf(
            TestCase(
                policyDuration = null,
                expectedDuration = Duration.ofDays(7)
            ),
            TestCase(
                policyDuration = Duration.ofDays(365),
                expectedDuration = Duration.ofDays(7)
            ),
            TestCase(
                policyDuration = Duration.ofMinutes(60),
                expectedDuration = Duration.ofMinutes(60)
            ),
            TestCase(
                tokenDuration = Duration.ofMinutes(30),
                policyDuration = Duration.ofMinutes(60),
                expectedDuration = Duration.ofMinutes(30),
            ),
            TestCase(
                tokenDuration = Duration.ofMinutes(60),
                policyDuration = Duration.ofMinutes(30),
                expectedDuration = Duration.ofMinutes(30),
            ),
            TestCase(
                tokenDuration = Duration.ofDays(365),
                expectedDuration = Duration.ofDays(7),
            ),
        )

        for (entry in testCases) {
            val config = ServiceLoginConfig(
                audience = "packit",
                policies = listOf(
                    ServiceLoginPolicy(
                    jwkSetURI = "http://issuer/jwks.json",
                    issuer = "issuer",
                    tokenDuration = entry.policyDuration
                )
                )
            )

            val start = Instant.now().truncatedTo(ChronoUnit.SECONDS)
            val token = exchangeTokens(config, { builder ->
                builder.issuer("issuer")
                builder.audience(listOf("packit"))
                if (entry.tokenDuration != null) {
                    builder.expiresAt(Instant.now() + entry.tokenDuration)
                }
            })
            val end = Instant.now()

            val lifespan = Duration.between(token.issuedAt, token.expiresAt)

            assertThat(token.issuedAt).isBetween(start, end)
            assertEquals(lifespan, entry.expectedDuration)
        }
    }

    @Test
    fun `can define multiple policies for the same issuer`() {
        val config = ServiceLoginConfig(
            audience = "packit",
            policies = listOf(
                ServiceLoginPolicy(
                    jwkSetURI = "http://issuer/jwks.json",
                    issuer = "issuer",
                    requiredClaims = mapOf("name" to "read-only"),
                    grantedPermissions = listOf("outpack.read"),
                ),
                ServiceLoginPolicy(
                    jwkSetURI = "http://issuer/jwks.json",
                    issuer = "issuer",
                    requiredClaims = mapOf("name" to "read-write"),
                    grantedPermissions = listOf("outpack.read", "outpack.write"),
                )
            )
        )

        val readToken = exchangeTokens(config, { builder ->
            builder.issuer("issuer")
            builder.audience(listOf("packit"))
            builder.claim("name", "read-only")
        })
        val writeToken = exchangeTokens(config, { builder ->
            builder.issuer("issuer")
            builder.audience(listOf("packit"))
            builder.claim("name", "read-write")
        })

        assertEquals(readToken.getClaimAsStringList("au"), listOf("outpack.read"))
        assertEquals(writeToken.getClaimAsStringList("au"), listOf("outpack.read", "outpack.write"))
    }

    @Test
    fun `can define multiple issuers`() {
        val issuer1 = createIssuer("http://issuer1/jwks.json")
        val issuer2 = createIssuer("http://issuer2/jwks.json")

        val config = ServiceLoginConfig(
            audience = "packit",
            policies = listOf(
                ServiceLoginPolicy(
                    jwkSetURI = "http://issuer1/jwks.json",
                    issuer = "issuer1",
                    grantedPermissions = listOf("outpack.read"),
                ),
                ServiceLoginPolicy(
                    jwkSetURI = "http://issuer2/jwks.json",
                    issuer = "issuer2",
                    grantedPermissions = listOf("outpack.read", "outpack.write"),
                )
            )
        )

        val readToken = exchangeTokens(
            config,
            issuer1.issue { builder ->
            builder.issuer("issuer1")
            builder.audience(listOf("packit"))
        }
        )
        val writeToken = exchangeTokens(
            config,
            issuer2.issue { builder ->
            builder.issuer("issuer2")
            builder.audience(listOf("packit"))
        }
        )

        assertEquals(readToken.getClaimAsStringList("au"), listOf("outpack.read"))
        assertEquals(writeToken.getClaimAsStringList("au"), listOf("outpack.read", "outpack.write"))
    }

    @Test
    fun `throws unauthorized if token is signed with wrong key`() {
        val untrustedIssuer = createIssuer("http://issuer/jwks.json")

        val config = ServiceLoginConfig(
            audience = "packit",
            policies = listOf(
                ServiceLoginPolicy(
                    jwkSetURI = "http://issuer/jwks.json",
                    issuer = "issuer",
                    grantedPermissions = listOf("outpack.read"),
                ),
            )
        )

        val ex = assertThrows<PackitException> {
            exchangeTokens(
                config,
                untrustedIssuer.issue { builder ->
                builder.issuer("issuer")
                builder.audience(listOf("packit"))
            }
            )
        }
        assertEquals(ex.key, "externalJwtTokenInvalid")
        assertEquals(ex.httpStatus, HttpStatus.UNAUTHORIZED)
    }
}
