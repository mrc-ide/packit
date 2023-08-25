package packit.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import packit.security.clients.BasicUserDetailsServiceClient

@Configuration
@EnableWebSecurity
class WebSecurityConfig(val customDetailsService: BasicUserDetailsServiceClient)
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
            .securityMatcher("/**")
            .authorizeHttpRequests { authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/").permitAll()
                    .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                    .requestMatchers("/admin/**").hasRole(Role.ADMIN.toString())
                    .anyRequest().authenticated()
            }
            .oauth2Login(withDefaults())
            .exceptionHandling { exceptionHandling ->
                exceptionHandling.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            }

        return httpSecurity.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder
    {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun authenticationManager(httpSecurity: HttpSecurity): AuthenticationManager
    {
        return httpSecurity.getSharedObject(AuthenticationManagerBuilder::class.java)
            .userDetailsService(customDetailsService)
            .passwordEncoder(passwordEncoder())
            .and()
            .build()
    }
}
