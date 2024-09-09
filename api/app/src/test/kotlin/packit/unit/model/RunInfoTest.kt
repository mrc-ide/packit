package packit.unit.model

import packit.model.RunInfo
import packit.model.toDto
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class RunInfoTest
{
    @Test
    fun `toDto return correct RunInfoDto for RunInfo`()
    {
        val runInfo = RunInfo(
            "task_id", "report_name", "PENDING", "hash", "branch", listOf("log1", "log2"),
            1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input")
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
    }
}