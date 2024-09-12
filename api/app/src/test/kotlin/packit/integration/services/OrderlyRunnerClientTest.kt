package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.model.dto.SubmitRunInfo
import packit.service.OrderlyRunnerClient
import packit.service.OutpackServerClient
import kotlin.test.assertEquals
import kotlin.test.assertIs

class OrderlyRunnerClientTest : IntegrationTest()
{

    @Autowired
    lateinit var sut: OrderlyRunnerClient

    @Autowired
    lateinit var sutOutpack: OutpackServerClient

    @Test
    fun `can get version`()
    {
        val result = sut.getVersion()

        assertIs<OrderlyRunnerVersion>(result)
        assertIs<String>(result.orderly2)
        assertIs<String>(result.orderlyRunner)
    }

    @Test
    fun `can get parameters`()
    {
        val testPacketGroupName = "parameters"
        val expectedParameters = listOf(
            Parameter("a", null),
            Parameter("b", 2),
            Parameter("c", null)
        )

        val result = sut.getParameters(testPacketGroupName, "HEAD")

        assertEquals(expectedParameters, result)
    }

    @Test
    fun `can get packet groups`()
    {
        val runnerPacketGroups = sut.getPacketGroups("HEAD")

        runnerPacketGroups.forEach {
            assertEquals(String::class.java, it.name::class.java)
            assertEquals(Double::class.java, it.updatedTime::class.java)
            assertEquals(Boolean::class.java, it.hasModifications::class.java)
        }
    }

    @Test
    fun `can submit report run`()
    {
        val branchInfo = sutOutpack.getBranches()
        val mainBranch = branchInfo.branches[0]
        val parameters = mapOf("a" to 1, "b" to 2)
        val submitInfo = SubmitRunInfo("parameters", mainBranch.name, mainBranch.commitHash, parameters)
        val res = sut.submitRun(submitInfo)

        assertEquals(String::class.java, res.taskId::class.java)
    }

    @Test
    fun `can get statuses of tasks`()
    {
//        run 2 tasks
        val branchInfo = sutOutpack.getBranches()
        val mainBranch = branchInfo.branches[0]
        val parameters = mapOf("a" to 1, "b" to 2)
        val submitInfo = SubmitRunInfo("parameters", mainBranch.name, mainBranch.commitHash, parameters)
        val res1 = sut.submitRun(submitInfo)
        val res2 = sut.submitRun(submitInfo)

        val taskIds = listOf(res1.taskId, res2.taskId)

        val statuses = sut.getTaskStatuses(taskIds, false)

        statuses.forEach {
            assertEquals(String::class.java, it.taskId::class.java)
            assertEquals(String::class.java, it.status::class.java)
        }
    }
}
