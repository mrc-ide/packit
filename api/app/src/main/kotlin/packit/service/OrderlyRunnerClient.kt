package packit.service

import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.RepositoryFetch
import packit.model.dto.RunnerPacketGroup
import packit.model.dto.RunnerSubmitRunInfo
import packit.model.dto.SubmitRunResponse
import packit.model.dto.TaskStatus

interface OrderlyRunner
{
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch(url: String)
    fun getBranches(url: String): GitBranches
    fun getParameters(url: String, ref: String, packetGroupName: String): List<Parameter>
    fun getPacketGroups(url: String, ref: String): List<RunnerPacketGroup>
    fun submitRun(info: RunnerSubmitRunInfo): SubmitRunResponse
    fun getTaskStatuses(taskIds: List<String>, includeLogs: Boolean): List<TaskStatus>
}

class OrderlyRunnerClient(val baseUrl: String) : OrderlyRunner
{
    override fun getVersion(): OrderlyRunnerVersion
    {
        return GenericClient.get(constructUrl("/"))
    }

    override fun gitFetch(url: String)
    {
        return GenericClient.post(
            constructUrl("repository/fetch"),
            RepositoryFetch(url = url)
        )
    }

    override fun getBranches(url: String): GitBranches
    {
        return GenericClient.get(
            constructUrl("repository/branches?url={url}"),
            mapOf("url" to url)
        )
    }

    override fun getPacketGroups(url: String, ref: String): List<RunnerPacketGroup>
    {
        return GenericClient.get(
            constructUrl("/report/list?url={url}&ref={ref}"),
            mapOf("url" to url, "ref" to ref)
        )
    }

    override fun getParameters(url: String, ref: String, packetGroupName: String): List<Parameter>
    {
        return GenericClient.get(
            constructUrl("report/parameters?url={url}&ref={ref}&name={name}"),
            mapOf("url" to url, "ref" to ref, "name" to packetGroupName)
        )
    }

    override fun submitRun(info: RunnerSubmitRunInfo): SubmitRunResponse
    {
        return GenericClient.post(constructUrl("/report/run"), info)
    }

    override fun getTaskStatuses(taskIds: List<String>, includeLogs: Boolean): List<TaskStatus>
    {
        return GenericClient.post(
            constructUrl("/report/status?include_logs={includeLogs}"),
            taskIds,
            mapOf("includeLogs" to includeLogs)
        )
    }

    private fun constructUrl(urlFragment: String): String
    {
        return "$baseUrl/$urlFragment"
    }
}
