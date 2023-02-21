package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import packit.model.Packet
import packit.repository.IndexRepository
import packit.service.BaseIndexService
import kotlin.test.assertEquals

class IndexServiceTest
{
    private val packets = listOf(Packet(1, "test", "test name", "", false))

    private val indexRepository = mock<IndexRepository> {
        on { findAll() } doReturn packets
    }

    @Test
    fun`gets packets`()
    {
        val sut = BaseIndexService(indexRepository)

        val result = sut.getPacket()

        assertEquals(result, packets)
    }
}