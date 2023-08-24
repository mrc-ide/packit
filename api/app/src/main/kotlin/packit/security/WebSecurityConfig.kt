package packit.security

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class WebSecurityConfig
{
    @Bean
    fun applicationSecurity(httpSecurity: HttpSecurity): SecurityFilterChain {
        httpSecurity
            .cors().disable()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .formLogin().disable()
            .securityMatcher("/**")
            .authorizeHttpRequests { authorizeRequests ->
                authorizeRequests
                    .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                    .anyRequest().authenticated()
            }


        return httpSecurity.build()
    }
}