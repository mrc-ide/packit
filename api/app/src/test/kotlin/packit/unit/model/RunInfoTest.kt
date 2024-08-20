package packit.unit.model

import packit.model.RunInfo
import packit.model.PacketGroup
import packit.model.toBasicDto
import packit.model.toDto
import java.util.*
import kotlin.test.Test
import kotlin.test.assertEquals

class RunInfoTest
{
    @Test
    fun `toDto return correct RunInfoDto for RunInfo`()
    {
        val packetGroup = PacketGroup("test_report", id = 1)
        val runInfo = RunInfo("task_id", packetGroup, "status", "hash", "branch", listOf("log1", "log2"), 1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input"))
        val runInfoDto = runInfo.toDto()
        assertEquals(runInfo.taskId, runInfoDto.taskId)
        assertEquals(runInfo.packetGroup.toDto(), runInfoDto.packetGroup)
        assertEquals(runInfo.status, runInfoDto.status)
        assertEquals(runInfo.commitHash, runInfoDto.commitHash)
        assertEquals(runInfo.branch, runInfoDto.branch)
        assertEquals(runInfo.logs, runInfoDto.logs)
        assertEquals(runInfo.timeStarted, runInfoDto.timeStarted)
        assertEquals(runInfo.timeCompleted, runInfoDto.timeCompleted)
        assertEquals(runInfo.timeQueued, runInfoDto.timeQueued)
        assertEquals(runInfo.packetId, runInfoDto.packetId)
        assertEquals(runInfo.parameters, runInfoDto.parameters)
    }

    @Test
    fun `toBasicDto return correct BasicRunInfoDto for RunInfo`()
    {
        val packetGroup = PacketGroup("test_report", id = 1)
        val runInfo = RunInfo("task_id", packetGroup, "status", "hash", "branch", listOf("log1", "log2"), 1.0, 1.0, 1.0, "packet_id", mapOf("param1" to "input"))
        val basicRunInfoDto = runInfo.toBasicDto()
        assertEquals(runInfo.taskId, basicRunInfoDto.taskId)
        assertEquals(runInfo.packetGroup.toDto(), basicRunInfoDto.packetGroup)
        assertEquals(runInfo.status, basicRunInfoDto.status)
        assertEquals(runInfo.commitHash, basicRunInfoDto.commitHash)
        assertEquals(runInfo.branch, basicRunInfoDto.branch)
        assertEquals(runInfo.timeStarted, basicRunInfoDto.timeStarted)
        assertEquals(runInfo.timeCompleted, basicRunInfoDto.timeCompleted)
        assertEquals(runInfo.timeQueued, basicRunInfoDto.timeQueued)
        assertEquals(runInfo.packetId, basicRunInfoDto.packetId)
        assertEquals(runInfo.parameters, basicRunInfoDto.parameters)
    }
}
