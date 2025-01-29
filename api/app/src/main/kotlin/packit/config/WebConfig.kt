package packit.config

import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig : WebMvcConfigurer {
    // Configure the thread pool for async requests. Explicit config is 'highly recommended'. See:
    // https://docs.spring.io/spring-framework/docs/4.3.12.RELEASE/spring-framework-reference/html/mvc.html#mvc-ann-async-configuration-spring-mvc
    override fun configureAsyncSupport(configurer: AsyncSupportConfigurer) {
        val executor = ThreadPoolTaskExecutor()
        executor.corePoolSize = 10
        executor.maxPoolSize = 50
        executor.queueCapacity = 100
        executor.setThreadNamePrefix("Async-")
        executor.initialize()
        configurer.setTaskExecutor(executor)
        configurer.setDefaultTimeout(60000)
    }
}