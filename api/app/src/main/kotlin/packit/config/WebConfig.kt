package packit.config

import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.util.concurrent.ThreadPoolExecutor

@Configuration
class WebConfig(private val taskExecutorProperties: TaskExecutorProperties) : WebMvcConfigurer {
    override fun configureAsyncSupport(configurer: AsyncSupportConfigurer) {
        val executor = ThreadPoolTaskExecutor()
        executor.corePoolSize = taskExecutorProperties.corePoolSize
        executor.maxPoolSize = taskExecutorProperties.maxPoolSize
        executor.queueCapacity = taskExecutorProperties.queueCapacity
        executor.setThreadNamePrefix("Async-")
        if (taskExecutorProperties.useCallerRunsPolicyToHandleRejectedExecution) {
            executor.setRejectedExecutionHandler(ThreadPoolExecutor.CallerRunsPolicy())
        }
        executor.initialize()
        configurer.setTaskExecutor(executor)
        configurer.setDefaultTimeout((taskExecutorProperties.keepAliveSeconds * 1000).toLong())
    }
}