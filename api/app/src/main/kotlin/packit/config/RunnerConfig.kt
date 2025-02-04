package packit.config

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.ConfigurationProperties

data class RunnerRepository(
  val url: String,
)

@ConfigurationProperties(prefix = "orderly.runner")
@ConditionalOnProperty(prefix = "orderly.runner", name = ["enabled"], havingValue = "true")
data class RunnerConfig(
  val url: String,
  val locationUrl: String,
  val repository: RunnerRepository
)
