package packit.service

import jakarta.transaction.Transactional
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

interface RunnerService {
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(ref: String, packetGroupName: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse
    fun getTaskStatus(taskId: String): RunInfo
    fun getTasksStatuses(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo>
    fun cancelTask(taskId: String)
    fun getTaskIdByPacketId(packetId: String): String
}

open class BaseRunnerService(
    private val config: RunnerConfig,
    private val orderlyRunnerClient: OrderlyRunner,
    private val runInfoRepository: RunInfoRepository,
    private val userService: UserService,
) : RunnerService {
    override fun getVersion(): OrderlyRunnerVersion {
        return orderlyRunnerClient.getVersion()
    }

    override fun gitFetch() {
        orderlyRunnerClient.gitFetch(config.repository)
    }

    override fun getBranches(): GitBranches {
        return orderlyRunnerClient.getBranches(config.repository)
    }

    override fun getParameters(ref: String, packetGroupName: String): List<Parameter> {
        return orderlyRunnerClient.getParameters(
            config.repository,
            ref,
            packetGroupName
        )
    }

    override fun getPacketGroups(ref: String): List<RunnerPacketGroup> {
        return orderlyRunnerClient.getPacketGroups(
            config.repository,
            ref
        )
    }

    override fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse {
        val request = RunnerSubmitRunInfo(
            packetGroupName = info.packetGroupName,
            branch = info.branch,
            commitHash = info.commitHash,
            parameters = info.parameters,
            location = OrderlyLocation.http(config.locationUrl),
            sshKey = config.repository.sshKey
        )

        val user = userService.getByUsername(username) ?: throw PackitException("userNotFound", HttpStatus.NOT_FOUND)
        val res = orderlyRunnerClient.submitRun(config.repository, request)
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

    override fun getTaskStatus(taskId: String): RunInfo {
        val runInfo =
            runInfoRepository.findByTaskId(taskId) ?: throw PackitException("runInfoNotFound", HttpStatus.NOT_FOUND)

        val taskStatus = orderlyRunnerClient.getTaskStatuses(listOf(taskId), true).statuses
            .firstOrNull() ?: return runInfo

        updateRunInfo(runInfo, taskStatus)
        runInfoRepository.save(runInfo)
        return runInfo
    }

    @Transactional
    override fun getTasksStatuses(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo> {
        println("Getting tasks statuses")
        val runInfos = getRunInfos(payload, filterPacketGroupName)
        println("Got run infos")
        if (runInfos.isEmpty) {
            return Page.empty()
        }
        val taskIds = runInfos.map { it.taskId }.content
        println("Mapped task ids")
        val taskStatuses = orderlyRunnerClient.getTaskStatuses(taskIds, false).statuses
        println("Got task statuses")
        val updated = updateRunInfosWithStatuses(runInfos, taskStatuses)
        println("Updated task statuses")

        return updated
    }

    override fun cancelTask(taskId: String) {
        val runInfo = runInfoRepository.findByTaskId(taskId)
            ?: throw PackitException("runInfoNotFound", HttpStatus.NOT_FOUND)

        orderlyRunnerClient.cancelTask(taskId)

        // Update the run info to reflect the cancellation
        runInfo.status = Status.CANCELLED.toString()
        runInfoRepository.save(runInfo)
    }
    override fun getTaskIdByPacketId(packetId: String): String {
        val runInfo = runInfoRepository.findByPacketId(packetId)
            ?: throw PackitException("runInfoNotFoundForPacket", HttpStatus.NOT_FOUND)

        return runInfo.taskId
    }

    internal fun updateRunInfosWithStatuses(runInfos: Page<RunInfo>, taskStatuses: List<TaskStatus>): Page<RunInfo> {
        runInfos.forEach { runInfo ->
            val taskStatus = taskStatuses.find { it.taskId == runInfo.taskId }
                ?: return@forEach

            updateRunInfo(runInfo, taskStatus)
        }
        runInfoRepository.saveAll(runInfos)

        return runInfos
    }

    internal fun updateRunInfo(runInfo: RunInfo, taskStatus: TaskStatus): RunInfo {
        return runInfo.apply {
            timeQueued = taskStatus.timeQueued
            timeStarted = taskStatus.timeStarted
            timeCompleted = taskStatus.timeComplete
            if (taskStatus.logs != null) {
                logs = taskStatus.logs
            }
            status = taskStatus.status
            packetId = taskStatus.packetId
            queuePosition = taskStatus.queuePosition
        }
    }

    internal fun getRunInfos(payload: PageablePayload, filterPacketGroupName: String): Page<RunInfo> {
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
    override fun cancelTask(taskId: String) = error()
    override fun getTaskIdByPacketId(packetId: String): String = error()
}

@Configuration
class RunnerServiceConfiguration {
    @Bean
    fun runnerService(
        config: RunnerConfig?,
        runInfoRepository: RunInfoRepository,
        userService: UserService,
    ): RunnerService {
        if (config != null) {
            val client = OrderlyRunnerClient(config)
            return BaseRunnerService(config, client, runInfoRepository, userService)
        } else {
            return DisabledRunnerService()
        }
    }
}
