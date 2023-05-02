package packit

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.boot.runApplication

@EnableScheduling
@SpringBootApplication
class App

fun main(args: Array<String>)
{
    runApplication<App>(*args)
}
