package packit

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class AppConfig
{

    @Value("\${outpack.server.url}")
    val outpackServerUrl: String = ""
}
