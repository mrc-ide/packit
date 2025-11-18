package packit.unit

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tag
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.assertj.core.api.Assertions.assertThat
import org.awaitility.Awaitility.await
import org.junit.jupiter.api.Test
import org.springframework.boot.actuate.autoconfigure.observation.ObservationAutoConfiguration
import org.springframework.boot.actuate.autoconfigure.scheduling.ScheduledTasksObservabilityAutoConfiguration
import org.springframework.boot.autoconfigure.AutoConfigurations
import org.springframework.boot.autoconfigure.task.TaskSchedulingAutoConfiguration
import org.springframework.boot.test.context.runner.ApplicationContextRunner
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import packit.ScheduledTaskObservationHandlerConfiguration
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit.SECONDS
import java.util.concurrent.atomic.AtomicInteger

class ScheduledTaskObservationHandlerTest {
    val runner =
        ApplicationContextRunner()
            .withBean(SimpleMeterRegistry::class.java)
            .withConfiguration(
                AutoConfigurations.of(
                    TaskSchedulingAutoConfiguration::class.java,
                    ObservationAutoConfiguration::class.java,
                    ScheduledTasksObservabilityAutoConfiguration::class.java,
                )
            )
            .withUserConfiguration(Config::class.java)
            .withUserConfiguration(ScheduledTaskObservationHandlerConfiguration::class.java)

    @Test
    fun succeedThenFail() {
        runner
            .withBean(SucceedThenFail::class.java)
            .run { context ->
                val registry = context.getBean(MeterRegistry::class.java)
                await().atMost(5, SECONDS).until({ ->
                    registry.find("tasks.scheduled.execution").timers().sumOf { it.count().toInt() } >= 2
                })

                // Stop the scheduler so we get a consistent view over the metrics.
                // Without this the tests are a bit flaky
                stopSchedulerAndWait(context.getBean(ThreadPoolTaskScheduler::class.java))

                assertThat(registry.get("tasks.scheduled.execution.last.outcome").gauges()).hasSize(1)

                val lastOutcome = registry.get("tasks.scheduled.execution.last.outcome").gauge()
                assertThat(lastOutcome.value()).isEqualTo(0.0)
                assertThat(lastOutcome.id.tags).containsExactlyInAnyOrder(
                    Tag.of("code.namespace", "packit.unit.ScheduledTaskObservationHandlerTest.SucceedThenFail"),
                    Tag.of("code.function", "task")
                )

                val lastExecution = registry.get("tasks.scheduled.execution.last.timestamp").gauge().value()
                val lastSuccess = registry.get("tasks.scheduled.execution.last.success.timestamp").gauge().value()
                assertThat(lastSuccess).isLessThan(lastExecution)
            }
    }

    @Test
    fun failThenSucceed() {
        runner
            .withBean(FailThenSucceed::class.java)
            .run { context ->
                val registry = context.getBean(MeterRegistry::class.java)
                await().atMost(5, SECONDS).until({ ->
                    registry.find("tasks.scheduled.execution").timers().sumOf { it.count() } >= 2
                })

                // Stop the scheduler so we get a consistent view over the metrics.
                // Without this the tests are a bit flaky
                stopSchedulerAndWait(context.getBean(ThreadPoolTaskScheduler::class.java))

                assertThat(registry.get("tasks.scheduled.execution.last.outcome").gauges()).hasSize(1)

                val lastOutcome = registry.get("tasks.scheduled.execution.last.outcome").gauge()
                assertThat(lastOutcome.value()).isEqualTo(1.0)
                assertThat(lastOutcome.id.tags).containsExactlyInAnyOrder(
                    Tag.of("code.namespace", "packit.unit.ScheduledTaskObservationHandlerTest.FailThenSucceed"),
                    Tag.of("code.function", "task")
                )

                val lastSuccess = registry.get("tasks.scheduled.execution.last.timestamp").gauge()
                val lastExecution = registry.get("tasks.scheduled.execution.last.success.timestamp").gauge()
                assertThat(lastSuccess.value()).isEqualTo(lastExecution.value())
            }
    }

    private fun stopSchedulerAndWait(scheduler: ThreadPoolTaskScheduler) {
        // ThreadPoolTaskScheduler.stop is asynchronous, it won't block to wait
        // for pending tasks to complete. We can pass a callback and manually
        // synchronize over it.
        val latch = CountDownLatch(1)
        scheduler.stop({ -> latch.countDown() })
        latch.await()
    }

    @Configuration
    @EnableScheduling
    class Config

    class SucceedThenFail {
        val counter = AtomicInteger(0)

        @Scheduled(fixedDelay = 10)
        fun task() {
            // First run succeeds, every subsequent ones fail.
            if (counter.incrementAndGet() >= 2) {
                throw Exception("failure")
            }
        }
    }

    class FailThenSucceed {
        val counter = AtomicInteger(0)

        @Scheduled(fixedDelay = 10)
        fun task() {
            // First run fails, every subsequent ones succeed.
            if (counter.incrementAndGet() == 1) {
                throw Exception("failure")
            }
        }
    }
}
