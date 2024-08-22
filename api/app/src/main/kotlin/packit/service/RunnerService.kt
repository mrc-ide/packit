package packit.service

import org.springframework.stereotype.Service
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunnerPacketGroup
import packit.model.dto.SubmitRunInfo
import packit.model.RunInfo
import packit.repository.PacketGroupRepository
import packit.repository.RunInfoRepository

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo): String
}

@Service
class BaseRunnerService(
    private val orderlyRunnerClient: OrderlyRunner,
    private val outpackServerClient: OutpackServer,
    private val packitGroupRepository: PacketGroupRepository,
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
        val packitGroup = packitGroupRepository.findOneByName(info.name)
        val runInfo = RunInfo(
            res.taskId,
            packitGroup,
            commitHash = info.hash,
            branch = info.branch,
            parameters = info.parameters
        )
        runInfoRepository.save(runInfo)
        return res.taskId
    }
}
