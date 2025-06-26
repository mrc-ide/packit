package packit.service

import packit.config.RunnerConfig
import packit.config.RunnerRepository
import packit.model.dto.*

interface OrderlyRunner {
    fun getVersion(): OrderlyRunnerVersion
    fun gitFetch(repo: RunnerRepository)
    fun getBranches(repo: RunnerRepository): GitBranches
    fun getParameters(repo: RunnerRepository, ref: String, packetGroupName: String): List<Parameter>
    fun getPacketGroups(repo: RunnerRepository, ref: String): List<RunnerPacketGroup>
    fun submitRun(repo: RunnerRepository, info: RunnerSubmitRunInfo): SubmitRunResponse
    fun getTaskStatuses(taskIds: List<String>, includeLogs: Boolean): TaskStatusesResponse
    fun cancelTask(taskId: String)
}

class OrderlyRunnerClient(val config: RunnerConfig) : OrderlyRunner {
    override fun getVersion(): OrderlyRunnerVersion {
        return GenericClient.get(constructUrl("/"))
    }

    override fun gitFetch(repo: RunnerRepository) {
        return GenericClient.post(
            constructUrl("repository/fetch?url={url}"),
            RepositoryFetch(sshKey = repo.sshKey),
            mapOf("url" to repo.url)
        )
    }

    override fun getBranches(repo: RunnerRepository): GitBranches {
        return GenericClient.get(
            constructUrl("repository/branches?url={url}"),
            mapOf("url" to repo.url)
        )
    }

    override fun getPacketGroups(repo: RunnerRepository, ref: String): List<RunnerPacketGroup> {
        return GenericClient.get(
            constructUrl("/report/list?url={url}&ref={ref}"),
            mapOf("url" to repo.url, "ref" to ref)
        )
    }

    override fun getParameters(repo: RunnerRepository, ref: String, packetGroupName: String): List<Parameter> {
        return GenericClient.get(
            constructUrl("report/parameters?url={url}&ref={ref}&name={name}"),
            mapOf("url" to repo.url, "ref" to ref, "name" to packetGroupName)
        )
    }

    override fun submitRun(repo: RunnerRepository, info: RunnerSubmitRunInfo): SubmitRunResponse {
        return GenericClient.post(
            constructUrl("/report/run?url={url}"),
            info,
            mapOf("url" to repo.url)
        )
    }

    override fun getTaskStatuses(taskIds: List<String>, includeLogs: Boolean): TaskStatusesResponse {
        return GenericClient.post(
            constructUrl("/report/status?include_logs={includeLogs}"),
            taskIds,
            mapOf("includeLogs" to includeLogs)
        )
    }

    override fun cancelTask(taskId: String) {
        return GenericClient.post(
            constructUrl("/report/cancel/$taskId"),
        )
    }

    private fun constructUrl(urlFragment: String): String {
        val baseUrl = config.url
        return "$baseUrl/$urlFragment"
    }
}
