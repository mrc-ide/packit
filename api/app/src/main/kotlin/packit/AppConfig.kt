package packit

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class AppConfig
{

    @Value("\${outpack.server.url}")
    val outpackServerUrl: String = ""
}
