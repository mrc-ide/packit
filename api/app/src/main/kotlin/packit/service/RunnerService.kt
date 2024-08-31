package packit.service

import org.springframework.stereotype.Service
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
    fun submitRun(info: SubmitRunInfo): SubmitRunResponse
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
}
