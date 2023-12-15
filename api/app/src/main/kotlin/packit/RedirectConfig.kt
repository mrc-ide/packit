package packit

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.web.DefaultRedirectStrategy
import org.springframework.security.web.RedirectStrategy

@Configuration
class RedirectConfig {
    @Bean
    fun redirectStrategy(): RedirectStrategy
    {
        return DefaultRedirectStrategy()
    }
}
