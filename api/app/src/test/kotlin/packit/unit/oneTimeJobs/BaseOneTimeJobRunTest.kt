package packit.unit.oneTimeJobs

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import packit.model.OneTimeJob
import packit.model.OneTimeJobStatus
import packit.oneTimeJobs.BaseOneTimeJobRun
import packit.repository.OneTimeJobRepository

class BaseOneTimeJobRunTest {

    private val oneTimeJobRepository = mock<OneTimeJobRepository>()
    private val jobName = "test-job"
    private lateinit var baseOneTimeJobRun: TestOneTimeJobRun

    @BeforeEach
    fun setUp() {
        baseOneTimeJobRun = TestOneTimeJobRun(oneTimeJobRepository, jobName)
    }

    @Test
    fun `skips execution when job is already completed`() {
        val completedJob = OneTimeJob(jobName, OneTimeJobStatus.COMPLETED.toString())
        whenever(oneTimeJobRepository.findByName(jobName)).thenReturn(completedJob)

        baseOneTimeJobRun.checkAndRun()

        assert(!baseOneTimeJobRun.performJobCalled)
    }

    @Test
    fun `executes job when status is not started`() {
        val notStartedJob = OneTimeJob(jobName, OneTimeJobStatus.NOT_STARTED.toString())
        whenever(oneTimeJobRepository.findByName(jobName)).thenReturn(notStartedJob)
        whenever(oneTimeJobRepository.save(notStartedJob)).thenReturn(notStartedJob)

        baseOneTimeJobRun.checkAndRun()

        verify(oneTimeJobRepository, times(2)).save(notStartedJob)
        assert(baseOneTimeJobRun.performJobCalled)
    }

    @Test
    fun `retries job when status is started`() {
        val startedJob = OneTimeJob(jobName, OneTimeJobStatus.STARTED.toString())
        whenever(oneTimeJobRepository.findByName(jobName)).thenReturn(startedJob)
        whenever(oneTimeJobRepository.save(startedJob)).thenReturn(startedJob)

        baseOneTimeJobRun.checkAndRun()

        verify(oneTimeJobRepository, times(2)).save(startedJob)
        assert(baseOneTimeJobRun.performJobCalled)
    }

    @Test
    fun `retries job when status is failed`() {
        val failedJob = OneTimeJob(jobName, OneTimeJobStatus.FAILED.toString())
        whenever(oneTimeJobRepository.findByName(jobName)).thenReturn(failedJob)
        whenever(oneTimeJobRepository.save(failedJob)).thenReturn(failedJob)

        baseOneTimeJobRun.checkAndRun()

        verify(oneTimeJobRepository, times(2)).save(failedJob)
        assert(baseOneTimeJobRun.performJobCalled)
    }

    @Test
    fun `creates new job when job does not exist`() {
        val newJob = OneTimeJob(jobName, OneTimeJobStatus.NOT_STARTED.toString())
        whenever(oneTimeJobRepository.findByName(jobName)).thenReturn(null)
        whenever(oneTimeJobRepository.save(any<OneTimeJob>())).thenReturn(newJob)

        baseOneTimeJobRun.checkAndRun()

        verify(oneTimeJobRepository, times(3)).save(any<OneTimeJob>())
        assert(baseOneTimeJobRun.performJobCalled)
    }

    @Test
    fun `marks job as failed when performJob throws exception`() {
        val job = OneTimeJob(jobName, OneTimeJobStatus.NOT_STARTED.toString())
        whenever(oneTimeJobRepository.findByName(jobName)).thenReturn(job)
        whenever(oneTimeJobRepository.save(job)).thenReturn(job)
        baseOneTimeJobRun.shouldThrowException = true

        baseOneTimeJobRun.checkAndRun()

        verify(
            oneTimeJobRepository,
            times(2)
        ).save(argThat { this.status == OneTimeJobStatus.FAILED.toString() && this.error != null })
    }

    @Test
    fun `preserves error message when job fails`() {
        val job = OneTimeJob(jobName, OneTimeJobStatus.NOT_STARTED.toString())
        val errorMessage = "Test error message"
        whenever(oneTimeJobRepository.save(job)).thenReturn(job)
        baseOneTimeJobRun.shouldThrowException = true
        baseOneTimeJobRun.exceptionMessage = errorMessage

        baseOneTimeJobRun.executeJob(job)

        verify(oneTimeJobRepository, times(2)).save(argThat { this.error == errorMessage })
    }

    private class TestOneTimeJobRun(
        oneTimeJobRepository: OneTimeJobRepository,
        jobName: String
    ) : BaseOneTimeJobRun(oneTimeJobRepository, jobName) {

        var performJobCalled = false
        var shouldThrowException = false
        var exceptionMessage = "Test exception"

        override fun performJob() {
            performJobCalled = true
            if (shouldThrowException) {
                throw IllegalStateException(exceptionMessage)
            }
        }
    }
}
