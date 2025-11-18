package packit

import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tag
import io.micrometer.core.instrument.Tags
import io.micrometer.core.instrument.TimeGauge
import io.micrometer.observation.Observation
import io.micrometer.observation.ObservationHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.support.ScheduledTaskObservationContext
import org.springframework.scheduling.support.ScheduledTaskObservationDocumentation
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeUnit.MILLISECONDS
import java.util.concurrent.atomic.AtomicReference

// Micrometer's interface for gauges is pretty unintuitive. It requires the
// caller to register the gauge exactly once, passing it a thread-safe state
// object. The gauge is updated by mutating that object, not by interacting
// with the registry.
//
// This is fine for single gauges (as shown in the micrometer docs), but isn't
// really usable as is for collections of gauges. Even the MultiGauge class
// doesn't really solve the problem.
//
// This class exposes an interface that is much closer to the usual Prometheus
// client library APIs. It memoizes the calls to register gauges, calling it
// only once per name and tags combination. Subsequent lookups return the
// existing AtomicReference.
//
// https://github.com/micrometer-metrics/micrometer/issues/5298
// https://github.com/micrometer-metrics/micrometer/issues/480
class GaugeMap(val registry: MeterRegistry) {
    private val gauges = ConcurrentHashMap<Pair<String, Tags>, AtomicReference<Double>>()

    // Get or create a gauge with the given name and tags.
    //
    // If the gauge does not yet exist, it will be initialized with the given
    // description and unit and given a NaN value.
    //
    // The returned AtomicReference can be modified to update the value of the
    // gauge.
    fun gauge(name: String, tags: Tags, description: String?, unit: String?): AtomicReference<Double> {
        val key = Pair(name, tags)

        val gauge = gauges.computeIfAbsent(key, { _ ->
            val reference = AtomicReference<Double>(Double.NaN)
            Gauge.builder(name, reference, { it.get() })
                .tags(tags)
                .description(description)
                .baseUnit(unit)
                .register(registry)
            reference
        })

        return gauge
    }

    fun timeGauge(name: String, tags: Tags, description: String?, unit: TimeUnit): AtomicReference<Double> {
        val key = Pair(name, tags)

        val gauge = gauges.computeIfAbsent(key, { _ ->
            val reference = AtomicReference<Double>(Double.NaN)
            TimeGauge.builder(name, reference, unit, { it.get() })
                .tags(tags)
                .description(description)
                .register(registry)
            reference
        })

        return gauge
    }
}

// This observation handler records the outcome of the last execution of a
// scheduled task. It makes it easy to tell whether a task has failed and how
// long it has been since the last successful run.
//
// The exposed metrics are:
// - tasks.scheduled.execution.last.outcome
// - tasks.scheduled.execution.last.timestamp
// - tasks.scheduled.execution.last.success.timestamp
//
// Spring already automatically records metrics for all observations, however
// these represent the aggregate of all executions, not the latest one.
class ScheduledTaskObservationHandler(registry: MeterRegistry) : ObservationHandler<ScheduledTaskObservationContext> {
    private val gauges = GaugeMap(registry)

    override fun onStop(context: ScheduledTaskObservationContext) {
        val tags = createTags(context)
        val now = Instant.now().toEpochMilli().toDouble()
        val outcome = if (context.getError() == null) 1.0 else 0.0

        gauges.gauge(
            context.getName() + ".last.outcome",
            tags,
            "Outcome of the last execution of a scheduled task",
            null
        ).set(outcome)

        gauges.timeGauge(
            context.getName() + ".last.timestamp",
            tags,
            "Timestamp of the last execution of a scheduled task",
            MILLISECONDS
        ).set(now)

        if (context.getError() == null) {
            gauges.timeGauge(
                context.getName() + ".last.success.timestamp",
                tags,
                "Timestamp of the last successful execution of a scheduled task",
                MILLISECONDS
            ).set(now)
        }
    }

    private fun createTags(context: ScheduledTaskObservationContext): Tags {
        // The Scheduled Task context carries more keys than this, in particular it
        // includes the outcome and exception. We intentionally omit these as we
        // want to aggregate the latest value over all possible outcomes.
        //
        // The only tag we use are the ones used to identify the task.
        val keys = listOf(
            ScheduledTaskObservationDocumentation.LowCardinalityKeyNames.CODE_NAMESPACE.asString(),
            ScheduledTaskObservationDocumentation.LowCardinalityKeyNames.CODE_FUNCTION.asString(),
        )

        return Tags.of(
            keys.map { key ->
                Tag.of(key, context.getLowCardinalityKeyValue(key).value)
            }
        )
    }

    override fun supportsContext(context: Observation.Context): Boolean {
        return context is ScheduledTaskObservationContext
    }
}

@Configuration
class ScheduledTaskObservationHandlerConfiguration {
    @Bean
    fun scheduledTaskObservationHandler(registry: MeterRegistry): ObservationHandler<ScheduledTaskObservationContext> {
        return ScheduledTaskObservationHandler(registry)
    }
}
