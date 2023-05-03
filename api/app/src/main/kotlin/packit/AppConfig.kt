package packit

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component

@Configuration
class AppConfig
{

    @Value("\${outpack.server.url}")
    val outpackServerUrl: String = ""
}
