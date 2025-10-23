package packit.unit.model

import packit.model.RunInfo
import packit.model.User
import packit.model.toBasicDto
import packit.model.toDto
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class RunInfoTest {
    private val testUser = User("user1", mutableListOf(), false, "source1", "displayName1", id = UUID.randomUUID())
    private val testUserNoDisplayName =
        User("user1", mutableListOf(), false, "source1", displayName = null, id = UUID.randomUUID())

    @Test
    fun `toDto return correct RunInfoDto for RunInfo`() {
        val runInfo = RunInfo(
            "task_id", "report_name", "PENDING", "hash", "branch", listOf("log1", "log2"),
            1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input"), user = testUser
        )
        val runInfoDto = runInfo.toDto()
        assertEquals(runInfo.taskId, runInfoDto.taskId)
        assertEquals(runInfo.packetGroupName, runInfoDto.packetGroupName)
        assertEquals(runInfo.status, runInfoDto.status.toString())
        assertEquals(runInfo.commitHash, runInfoDto.commitHash)
        assertEquals(runInfo.branch, runInfoDto.branch)
        assertEquals(runInfo.logs, runInfoDto.logs)
        assertEquals(runInfo.timeStarted, runInfoDto.timeStarted)
        assertEquals(runInfo.timeCompleted, runInfoDto.timeCompleted)
        assertEquals(runInfo.timeQueued, runInfoDto.timeQueued)
        assertEquals(runInfo.packetId, runInfoDto.packetId)
        assertEquals(runInfo.parameters, runInfoDto.parameters)
        assertEquals(runInfo.timeQueued, runInfoDto.timeQueued)
        assertEquals(runInfo.user.displayName, runInfoDto.runBy)
    }

    @Test
    fun `toBasicDto return correct BasicRunInfoDto for RunInfo`() {
        val runInfo = RunInfo(
            "task_id", "report_name", "PENDING", "hash", "branch", listOf("log1", "log2"),
            1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input"), user = testUser
        )
        val basicRunInfoDto = runInfo.toBasicDto()
        assertEquals(runInfo.taskId, basicRunInfoDto.taskId)
        assertEquals(runInfo.packetGroupName, basicRunInfoDto.packetGroupName)
        assertEquals(runInfo.status, basicRunInfoDto.status.toString())
        assertEquals(runInfo.branch, basicRunInfoDto.branch)
        assertEquals(runInfo.commitHash, basicRunInfoDto.commitHash)
        assertEquals(runInfo.parameters, basicRunInfoDto.parameters)
        assertEquals(runInfo.packetId, basicRunInfoDto.packetId)
        assertEquals(runInfo.user.displayName, basicRunInfoDto.runBy)
    }

    @Test
    fun `toDto should fallback to username if displayName is null`() {
        val runInfo = RunInfo(
            "task_id", "report_name", "PENDING", "hash", "branch", listOf("log1", "log2"),
            1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input"), user = testUserNoDisplayName
        )
        val runInfoDto = runInfo.toDto()
        assertEquals(runInfo.user.username, runInfoDto.runBy)
    }

    @Test
    fun `toBasicDto should fallback to username if displayName is null`() {
        val runInfo = RunInfo(
            "task_id", "report_name", "PENDING", "hash", "branch", listOf("log1", "log2"),
            1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input"), user = testUserNoDisplayName
        )
        val basicRunInfoDto = runInfo.toBasicDto()
        assertEquals(runInfo.user.username, basicRunInfoDto.runBy)
    }
}
