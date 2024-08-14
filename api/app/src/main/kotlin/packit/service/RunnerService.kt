package packit.service

import org.springframework.stereotype.Service
import packit.model.dto.OrderlyRunnerVersion

interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch()
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

}
