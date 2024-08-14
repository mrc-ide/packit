package packit.service

import org.springframework.stereotype.Service
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
    fun getBranches(): GitBranches
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
}
