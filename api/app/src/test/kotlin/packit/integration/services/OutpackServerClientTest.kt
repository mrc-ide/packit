package packit.integration.services

import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.dto.GitBranchInfo
import packit.service.OutpackServerClient
import kotlin.test.assertEquals

class OutpackServerClientTest : IntegrationTest()
{

    @Autowired
    lateinit var sut: OutpackServerClient

    @Test
    fun `can get checksum`()
    {
        val result = sut.getChecksum()
        assert(result.startsWith("sha256"))
    }

    @Test
    fun `can get metadata`()
    {
        val result = sut.getMetadata()
        assert(result.map { it.name }.containsAll(listOf("parameters", "explicit", "depends", "computed-resource")))
    }

    @Test
    fun `can git fetch`()
    {
        val res = sut.gitFetch()
        assertEquals(Unit, res)
    }

    @Test
    fun `can get git branches`()
    {
        val testBranchName = "master"
        val testBranchMessages = listOf("first commit")
        val gitBranchesInfo = GitBranchInfo(
            "master",
            ArgumentMatchers.anyString(),
            ArgumentMatchers.anyLong(),
            listOf("first commit")
        )
        val resBody = sut.getBranches()

        assertEquals(testBranchName, resBody.defaultBranch.name)
        assertEquals(testBranchMessages, resBody.defaultBranch.message)
        assertEquals(Long::class.java, resBody.defaultBranch.time::class.java)
        assertEquals(String::class.java, resBody.defaultBranch.commitHash::class.java)
        assertEquals(testBranchName, resBody.branches[0].name)
        assertEquals(testBranchMessages, resBody.branches[0].message)
    }
}
