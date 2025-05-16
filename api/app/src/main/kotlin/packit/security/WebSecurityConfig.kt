package packit.security

import jakarta.servlet.DispatcherType
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.logout.LogoutFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import packit.AppConfig
import packit.exceptions.FilterChainExceptionHandler
import packit.exceptions.PackitExceptionHandler
import packit.security.oauth2.OAuth2FailureHandler
import packit.security.oauth2.OAuth2SuccessHandler
import packit.security.oauth2.OAuth2UserService
import packit.security.provider.JwtIssuer
import packit.service.BasicUserDetailsService

@ConditionalOnProperty(prefix = "auth", name = ["enabled"], havingValue = "true", matchIfMissing = true)
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityEnabledConfig {
    private val log: Logger = LoggerFactory.getLogger(SecurityEnabledConfig::class.java)

    init {
        log.info("Authentication and Authorization are enabled")
    }
}

@Configuration
class WebSecurityConfig(
    val customOauth2UserService: OAuth2UserService,
    val customBasicUserService: BasicUserDetailsService,
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val browserRedirect: BrowserRedirect,
    val exceptionHandler: PackitExceptionHandler
) {
    @Bean
    @Order(1)
    fun actuatorSecurityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain {
        // We allow unrestricted access to all the actuator endpoints. In
        // practice however, only select endpoints are enabled in
        // application.properties, and even the ones that are are all exposed on a
        // different port than the default http server.
        httpSecurity
            .securityMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeHttpRequests { authorizeRequests ->
                authorizeRequests.anyRequest().permitAll()
            }

        return httpSecurity.build()
    }

    @Bean
    @Order(2)
    fun securityFilterChain(
        httpSecurity: HttpSecurity,
        authStrategySwitch: AuthStrategySwitch,
        filterChainExceptionHandler: FilterChainExceptionHandler
    ): SecurityFilterChain {
        httpSecurity
            .cors { it.configurationSource(getCorsConfigurationSource()) }
            .csrf { it.disable() }
            .addFilterBefore(filterChainExceptionHandler, LogoutFilter::class.java)
            .addFilterAfter(authStrategySwitch, LogoutFilter::class.java)
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .formLogin { it.disable() }
            .handleSecurePaths()
            .handleOauth2Login()
            .exceptionHandling { it.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) }

        return httpSecurity.build()
    }

    /**
     * This is used to allow the frontend to make requests to the backend.
     * The allowed origins are the local development server and the production server.
     * The allowed methods are GET, POST, PUT, DELETE, and OPTIONS.
     * The allowed headers are all headers.
     * @return CorsConfigurationSource
     */
    private fun getCorsConfigurationSource(): CorsConfigurationSource {
        val corsConfig = CorsConfiguration()
        corsConfig.allowedOriginPatterns = config.allowedOrigins
        corsConfig.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        corsConfig.allowedHeaders = listOf("*")
        return CorsConfigurationSource { corsConfig }
    }

    fun HttpSecurity.handleOauth2Login(): HttpSecurity {
        if (config.authEnableGithubLogin) {
            this.oauth2Login { oauth2Login ->
                oauth2Login
                    .userInfoEndpoint { it.userService(customOauth2UserService) }
                    .successHandler(OAuth2SuccessHandler(browserRedirect, jwtIssuer))
                    .failureHandler(OAuth2FailureHandler(browserRedirect, exceptionHandler))
            }
        }
        return this
    }

    fun HttpSecurity.handleSecurePaths(): HttpSecurity {
        if (config.authEnabled) {
            this.securityMatcher("/**")
                .authorizeHttpRequests {
                    it
                        .requestMatchers("/").permitAll()
                        .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                        .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                        .anyRequest().authenticated()
                }
        } else {
            this.securityMatcher("/**")
                .authorizeHttpRequests { it.anyRequest().permitAll() }
        }

        return this
    }

    @Bean
    fun authenticationManager(httpSecurity: HttpSecurity): AuthenticationManager {
        return httpSecurity.getSharedObject(AuthenticationManagerBuilder::class.java)
            .userDetailsService(customBasicUserService)
            .passwordEncoder(config.passwordEncoder())
            .and()
            .build()
    }
}
