package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.RunInfo
import packit.model.dto.*
import packit.repository.RunInfoRepository

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse
    fun getTaskStatus(taskId: String): RunInfo
    fun getTasksStatuses(): List<RunInfo>
}

@Service
class BaseRunnerService(
    private val orderlyRunnerClient: OrderlyRunner,
    private val outpackServerClient: OutpackServer,
    private val runInfoRepository: RunInfoRepository
) : RunnerService
{
    override fun getVersion(): OrderlyRunnerVersion
    {
        return orderlyRunnerClient.getVersion()
    }

    override fun gitFetch()
    {
        outpackServerClient.gitFetch()
    }

    override fun getBranches(): GitBranches
    {
        return outpackServerClient.getBranches()
    }

    override fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    {
        return orderlyRunnerClient.getParameters(packetGroupName, ref)
    }

    override fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    {
        return orderlyRunnerClient.getPacketGroups(ref)
    }

    override fun submitRun(info: SubmitRunInfo, username: String): SubmitRunResponse
    {
        val res = orderlyRunnerClient.submitRun(info)
        val runInfo = RunInfo(
            res.taskId,
            packetGroupName = info.packetGroupName,
            commitHash = info.commitHash,
            branch = info.branch,
            parameters = info.parameters,
            status = Status.PENDING.toString(),
            username = username
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

    override fun getTasksStatuses(): List<RunInfo>
    {
        val runInfos = runInfoRepository.findAll()
        val taskIds = runInfos.map { it.taskId }
        val taskStatuses = orderlyRunnerClient.getTaskStatuses(taskIds, false)

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
}
