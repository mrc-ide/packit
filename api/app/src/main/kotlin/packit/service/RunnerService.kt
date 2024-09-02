package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.RunInfo
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunInfoDto
import packit.model.dto.RunnerPacketGroup
import packit.model.dto.Status
import packit.model.dto.SubmitRunInfo
import packit.model.toDto
import packit.repository.RunInfoRepository

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo): String
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

    override fun submitRun(info: SubmitRunInfo): String
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
        return res.taskId
    }

    override fun getTaskStatus(taskId: String): RunInfoDto
    {
        val taskStatus = orderlyRunnerClient.getTaskStatuses(listOf(taskId), true)[0]

        val runInfo = runInfoRepository.findByTaskId(taskId)
        if (runInfo == null) {
            throw PackitException("runInfoNotFound", HttpStatus.NOT_FOUND)
        }

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
