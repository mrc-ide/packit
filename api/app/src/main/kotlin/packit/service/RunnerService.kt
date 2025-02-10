package packit.service

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import packit.config.RunnerConfig
import packit.exceptions.PackitException
import packit.model.PageablePayload
import packit.model.RunInfo
import packit.model.dto.*
import packit.repository.RunInfoRepository

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(ref: String, packetGroupName: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse
    fun getTaskStatus(taskId: String): RunInfo
    fun getTasksStatuses(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo>
}

class BaseRunnerService(
    private val config: RunnerConfig,
    private val orderlyRunnerClient: OrderlyRunner,
    private val runInfoRepository: RunInfoRepository,
    private val userService: UserService,
) : RunnerService
{
    override fun getVersion(): OrderlyRunnerVersion
    {
        return orderlyRunnerClient.getVersion()
    }

    override fun gitFetch()
    {
        orderlyRunnerClient.gitFetch(config.repository.url)
    }

    override fun getBranches(): GitBranches
    {
        return orderlyRunnerClient.getBranches(config.repository.url)
    }

    override fun getParameters(ref: String, packetGroupName: String): List<Parameter>
    {
        return orderlyRunnerClient.getParameters(
            config.repository.url,
            ref,
            packetGroupName
        )
    }

    override fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    {
        return orderlyRunnerClient.getPacketGroups(
            config.repository.url,
            ref
        )
    }

    override fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse
    {
        val request = RunnerSubmitRunInfo(
            packetGroupName = info.packetGroupName,
            branch = info.branch,
            commitHash = info.commitHash,
            parameters = info.parameters,
            location = OrderlyLocation.http(config.locationUrl),
            sshKey = null
        )

        val user = userService.getByUsername(username) ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)
        val res = orderlyRunnerClient.submitRun(config.repository.url, request)
        val runInfo = RunInfo(
            res.taskId,
            packetGroupName = info.packetGroupName,
            commitHash = info.commitHash,
            branch = info.branch,
            parameters = info.parameters,
            status = Status.PENDING.toString(),
            user = user
        )
        runInfoRepository.save(runInfo)
        return res
    }

    override fun getTaskStatus(taskId: String): RunInfo
    {
        val runInfo =
            runInfoRepository.findByTaskId(taskId) ?: throw PackitException("runInfoNotFound", HttpStatus.NOT_FOUND)

        val taskStatus = orderlyRunnerClient.getTaskStatuses(listOf(taskId), true).first()

        updateRunInfo(runInfo, taskStatus)
        runInfoRepository.save(runInfo)

        return runInfo
    }

    override fun getTasksStatuses(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo>
    {
        val runInfos = getRunInfos(payload, filterPacketGroupName)
        if (runInfos.isEmpty)
        {
            return Page.empty()
        }
        val taskIds = runInfos.map { it.taskId }.content
        val taskStatuses = orderlyRunnerClient.getTaskStatuses(taskIds, false)

        return updateRunInfosWithStatuses(runInfos, taskStatuses)
    }

    internal fun updateRunInfosWithStatuses(runInfos: Page<RunInfo>, taskStatuses: List<TaskStatus>): Page<RunInfo>
    {
        runInfos.forEach { runInfo ->
            val taskStatus = taskStatuses.find { it.taskId == runInfo.taskId }
                ?: throw PackitException("runInfoNotFound", HttpStatus.NOT_FOUND)

            updateRunInfo(runInfo, taskStatus)
        }
        runInfoRepository.saveAll(runInfos)

        return runInfos
    }

    internal fun updateRunInfo(runInfo: RunInfo, taskStatus: TaskStatus): RunInfo
    {
        return runInfo.apply {
            timeQueued = taskStatus.timeQueued
            timeStarted = taskStatus.timeStarted
            timeCompleted = taskStatus.timeComplete
            if (taskStatus.logs != null)
            {
                logs = taskStatus.logs
            }
            status = taskStatus.status
            packetId = taskStatus.packetId
            queuePosition = taskStatus.queuePosition
        }
    }

    internal fun getRunInfos(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo>
    {
        val pageable = PageRequest.of(
            payload.pageNumber,
            payload.pageSize,
            Sort.by("timeQueued")
                .descending() // NULL values sorted first (newest as have not had status called on them yet)
        )

        return runInfoRepository.findAllByPacketGroupNameContaining(filterPacketGroupName, pageable)
    }
}

class DisabledRunnerService : RunnerService {
    fun error(): Nothing {
        throw PackitException("runnerDisabled", HttpStatus.FORBIDDEN)
    }

    override fun getVersion(): OrderlyRunnerVersion = error()
    override fun gitFetch() = error()
    override fun getBranches(): GitBranches = error()
    override fun getParameters(ref: String, packetGroupName: String): List<Parameter> = error()
    override fun getPacketGroups(ref: String): List<RunnerPacketGroup> = error()
    override fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse = error()
    override fun getTaskStatus(taskId: String): RunInfo = error()
    override fun getTasksStatuses(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo> = error()
}

@Configuration
class RunnerServiceConfiguration
{
    @Bean
    fun runnerService(
        config: RunnerConfig?,
        runInfoRepository: RunInfoRepository,
        userService: UserService,
    ): RunnerService {
        if (config != null) {
            val client = OrderlyRunnerClient(config.url)
            return BaseRunnerService(config, client, runInfoRepository, userService)
        } else {
            return DisabledRunnerService()
        }
    }
}
