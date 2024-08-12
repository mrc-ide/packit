package packit.service

import org.springframework.stereotype.Service
import packit.model.dto.OrderlyRunnerVersion


interface RunnerService
{
    fun getVersion(): OrderlyRunnerVersion
}

@Service
class BaseRunnerService(
    private val orderlyRunnerClient: OrderlyRunnerClient
) : RunnerService
{
    override fun getVersion(): OrderlyRunnerVersion
    {
        return orderlyRunnerClient.getVersion()
    }
}
