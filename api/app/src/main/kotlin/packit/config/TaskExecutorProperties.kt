package packit.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
* Explicitly configures the thread pool for async requests, since explicit config is 'highly recommended' [1] for
* such requests.
* At time of writing, the only async request is thought to be /packets/{name}/{id}/zip, since it uses a
* StreamingResponseBody type [1], [2]; this motivated the introduction of this explicit configuration.
*
* The values here (and in application.properties) are defaults, which conservatively assume deployment on a lower-spec
* machine, and aim to minimize the risk of overloading the machine, rather than to optimize response time.
* If you know the properties of your hosting machine and context (how many threads can it handle concurrently? how
* significant are the bottlenecks of disk-reading I/O and network-writing I/O? how many users do you need to handle at
* once?), you can adjust these values to better fit your needs by setting the environment variables read in by
* application.properties.
*
* If the machine can theoretically handle a large number of threads, maximizing this won't necessarily improve
* throughput, since file-streaming is an I/O-bound operation, which means that threads will spend most of their time
* waiting for their turn to use the I/O (taking up about 1MB of RAM each, in the case of a 64-bit JVM), rather than
* doing any useful work with the CPU.
*
* References/docs:
* 1) https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/StreamingResponseBody.html
* 2) https://docs.spring.io/spring-framework/docs/4.3.12.RELEASE/spring-framework-reference/html/mvc.html#mvc-ann-async-output-stream
* 3) https://docs.spring.io/spring-framework/docs/4.3.12.RELEASE/spring-framework-reference/html/mvc.html#mvc-ann-async-configuration-spring-mvc
* 4) https://www.baeldung.com/thread-pool-java-and-guava
* 5) https://docs.spring.io/spring-framework/reference/integration/scheduling.html#scheduling-task-scheduler
* 6) https://codingtim.github.io/spring-threadpooltaskexecutor/
*/
@Configuration
@ConfigurationProperties(prefix = "packit.task-executor")
class TaskExecutorProperties {
    // A number of core threads, which are always maintained for re-use.
    val corePoolSize: Int = 4

    // If the queue is full, and the core threads are all busy, new threads are created up to this limit, to handle
    // bursts of load.
    var maxPoolSize: Int = 10

    // The queue fills up first, before any non-core thread is spawned.
    var queueCapacity: Int = 100

    // Number of seconds after which to clean up idle, non-core threads during periods of low load.
    var keepAliveSeconds: Int = 60

    // Under the 'caller runs policy', if the queue is full, and the core threads are all busy, the caller thread will
    // run the task itself instead. This "provides a simple way to throttle the incoming load": see
    // a) https://docs.spring.io/spring-framework/reference/integration/scheduling.html#scheduling-task-namespace-executor
    // b) https://www.baeldung.com/java-rejectedexecutionhandler
    // This throttling results from occupying the web container thread, which slows the rate it can accept new requests.
    // If this property is set to false, the default policy is to abort. This may lead to clients re-trying, which could
    // create even more load on the server.
    var useCallerRunsPolicyToHandleRejectedExecution: Boolean = true
}