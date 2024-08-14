package packit.integration.services

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import packit.integration.IntegrationTest
import packit.model.dto.GitBranchInfo
import packit.service.OutpackServerClient
import kotlin.test.assertContains
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
        val res = sut.getBranches()

        assertContains(
            res, GitBranchInfo(
                "master",
                "34bb6b7f38139420b029f28ace8e5c9f46145c0d",
                1723627545,
                listOf("first commit")
            )
        )
    }
}
