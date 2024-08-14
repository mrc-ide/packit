package packit.service

import org.springframework.stereotype.Service
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunnerPacketGroup

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
    fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
}

@Service
class BaseRunnerService(
    private val orderlyRunnerClient: OrderlyRunnerClient,
    private val outpackServerClient: OutpackServerClient
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
}
