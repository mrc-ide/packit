package packit

import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.binder.MeterBinder
import org.springframework.boot.info.GitProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class BuildInfoMetrics {
  @Bean
  fun appBuildInfoMetrics(gitProperties: GitProperties): MeterBinder {
    return MeterBinder { registry ->
      Gauge.builder("packit_api.build.info", { 1 })
           .strongReference(true)
           .tag("revision", gitProperties.commitId)
           .register(registry)
    }
  }
}
