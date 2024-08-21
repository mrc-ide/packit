package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
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
        val gitBranches = sut.getBranches()

        assertEquals(testBranchName, gitBranches.defaultBranch)
        assertEquals(testBranchName, gitBranches.branches[0].name)
        assertEquals(testBranchMessages, gitBranches.branches[0].message)
        assertEquals(Long::class.java, gitBranches.branches[0].time::class.java)
        assertEquals(String::class.java, gitBranches.branches[0].commitHash::class.java)
    }
}
