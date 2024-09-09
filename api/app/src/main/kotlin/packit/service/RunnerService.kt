package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.RunInfo
import packit.model.dto.*
import packit.model.toDto
import packit.repository.RunInfoRepository

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo): SubmitRunResponse
    fun getTaskStatus(taskId: String): RunInfoDto
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

    override fun submitRun(info: SubmitRunInfo): SubmitRunResponse
    {
        val res = orderlyRunnerClient.submitRun(info)
        val runInfo = RunInfo(
            res.taskId,
            packetGroupName = info.packetGroupName,
            commitHash = info.commitHash,
            branch = info.branch,
            parameters = info.parameters,
            status = Status.PENDING.toString()
        )
        runInfoRepository.save(runInfo)
        return res
    }

    override fun getTaskStatus(taskId: String): RunInfoDto
    {
        val runInfo = runInfoRepository.findByTaskId(taskId)
        if (runInfo == null)
        {
            throw PackitException("runInfoNotFound", HttpStatus.NOT_FOUND)
        }

        val taskStatus = orderlyRunnerClient.getTaskStatuses(listOf(taskId), true)[0]

        runInfo.apply {
            timeQueued = taskStatus.timeQueued
            timeStarted = taskStatus.timeStarted
            timeCompleted = taskStatus.timeComplete
            logs = taskStatus.logs
            status = taskStatus.status
            packetId = taskStatus.packetId
            queuePosition = taskStatus.queuePosition
        }
        runInfoRepository.save(runInfo)

        return runInfo.toDto()
    }
}
