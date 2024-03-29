package packit.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import packit.AppConfig
import packit.exceptions.PackitExceptionHandler
import packit.security.oauth2.*
import packit.security.provider.JwtIssuer

@EnableWebSecurity
@Configuration
class WebSecurityConfig(
    val customOauth2UserService: OAuth2UserService,
    val config: AppConfig,
    val jwtIssuer: JwtIssuer,
    val browserRedirect: BrowserRedirect,
    val exceptionHandler: PackitExceptionHandler
)
{
    @Bean
    fun securityFilterChain(
        httpSecurity: HttpSecurity,
        tokenAuthenticationFilter: TokenAuthenticationFilter,
    ): SecurityFilterChain
    {
        httpSecurity
            .cors(withDefaults())
            .csrf().disable()
            .addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .formLogin().disable()
            .handleSecurePaths()
            .handleOauth2Login()
            .exceptionHandling { exceptionHandling ->
                exceptionHandling.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            }

        return httpSecurity.build()
    }

    fun HttpSecurity.handleOauth2Login(): HttpSecurity
    {
        if (config.authEnableGithubLogin)
        {
             this.oauth2Login { oauth2Login ->
                oauth2Login
                    .userInfoEndpoint().userService(customOauth2UserService)
                    .and()
                    .successHandler(OAuth2SuccessHandler(browserRedirect, jwtIssuer))
                    .failureHandler(OAuth2FailureHandler(browserRedirect, exceptionHandler))
            }
        }
        return this
    }

    fun HttpSecurity.handleSecurePaths(): HttpSecurity
    {
        if (config.authEnabled)
        {
            this.securityMatcher("/**")
                .authorizeHttpRequests { authorizeRequests ->
                    authorizeRequests
                        .requestMatchers("/").permitAll()
                        .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                }
        } else
        {
            this.securityMatcher("/**")
                .authorizeHttpRequests()
                .anyRequest().permitAll()
        }

        return this
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder
    {
        return BCryptPasswordEncoder()
    }
}
