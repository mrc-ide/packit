package packit.service

import org.springframework.stereotype.Service
import packit.AppConfig
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RunnerPacketGroup
import packit.model.dto.SubmitRunInfo
import packit.model.dto.SubmitRunResponse

interface OrderlyRunner
{
    fun getVersion(): OrderlyRunnerVersion
    fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    fun submitRun(info: SubmitRunInfo): SubmitRunResponse
}

@Service
class OrderlyRunnerClient(appConfig: AppConfig) : OrderlyRunner
{
    val baseUrl: String = appConfig.orderlyRunnerUrl
    override fun getVersion(): OrderlyRunnerVersion
    {
        return GenericClient.get(constructUrl("/"))
    }

    override fun getParameters(packetGroupName: String, ref: String): List<Parameter>
    {
        return GenericClient.get(constructUrl("/report/$packetGroupName/parameters?ref=$ref"))
    }

    override fun getPacketGroups(ref: String): List<RunnerPacketGroup>
    {
        return GenericClient.get(constructUrl("/report/list?ref=$ref"))
    }

    override fun submitRun(info: SubmitRunInfo): SubmitRunResponse
    {
        return GenericClient.post(constructUrl("/report/run"), info)
    }

    private fun constructUrl(urlFragment: String): String
    {
        return "$baseUrl/$urlFragment"
    }
}
