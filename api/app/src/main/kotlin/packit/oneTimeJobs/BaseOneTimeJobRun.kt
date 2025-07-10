package packit.oneTimeJobs

import jakarta.annotation.PostConstruct
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import packit.model.OneTimeJob
import packit.model.OneTimeJobStatus
import packit.repository.OneTimeJobRepository

abstract class BaseOneTimeJobRun(
    protected val oneTimeJobRepository: OneTimeJobRepository,
    protected val jobName: String
) {
    protected val log: Logger = LoggerFactory.getLogger(this::class.java)

    @Transactional
    @PostConstruct
    open fun checkAndRun() {
        val job = getOrCreateJob()
        when (enumValueOf<OneTimeJobStatus>(job.status)) {
            OneTimeJobStatus.COMPLETED -> {
                log.info("✅ OneTimeJob: $jobName already completed, skipping")
                return
            }

            OneTimeJobStatus.STARTED -> {
                log.warn("⚠️ OneTimeJob: $jobName appears to not have finished previously, attempting retry...")
            }

            OneTimeJobStatus.FAILED -> {
                log.warn("❌ Previous OneTimeJob: $jobName failed, attempting retry...")
            }

            OneTimeJobStatus.NOT_STARTED -> {
                log.info("🚀 Starting new OneTimeJob: $jobName")
            }

            else -> return
        }

        executeJob(job)
    }

    internal fun executeJob(job: OneTimeJob) {
        try {
            updateJobStatus(job, OneTimeJobStatus.STARTED)
            // perform the actual job logic from the abstract method
            performJob()

            updateJobStatus(job, OneTimeJobStatus.COMPLETED)
            log.info("✅ OneTimeJob: $jobName has been completed")
        } catch (e: Exception) {
            log.error("❌ OneTimeJob: $jobName failed", e)
            updateJobStatus(job, OneTimeJobStatus.FAILED, e.message)
        }
    }

    // Abstract method that each job implementation must provide
    protected abstract fun performJob()

    internal fun getOrCreateJob(): OneTimeJob {
        return oneTimeJobRepository.findByName(jobName)
            ?: oneTimeJobRepository.save(
                OneTimeJob(
                    jobName,
                    OneTimeJobStatus.NOT_STARTED.toString()
                )
            )
    }

    internal fun updateJobStatus(
        job: OneTimeJob,
        status: OneTimeJobStatus,
        errorMessage: String? = null
    ) {
        oneTimeJobRepository.save(
            job.apply {
                this.status = status.toString()
                this.error = errorMessage
            }
        )
    }
}
