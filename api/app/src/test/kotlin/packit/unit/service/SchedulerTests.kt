package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.internal.verification.Times
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import packit.service.OutpackServerClient
import packit.service.PacketService
import packit.service.Scheduler

class SchedulerTests
{
    private val mockPacketService = mock<PacketService> {
        on { getChecksum() } doReturn "1"
    }
    private val mockOutpackServerClient = mock<OutpackServerClient> {
        on { getChecksum() } doReturn "2"
    }

    @Test
    fun `imports packets if checksum has changed`()
    {
        val sut = Scheduler(mockPacketService, mockOutpackServerClient)
        sut.checkPackets()
        verify(mockPacketService).importPackets()
    }

    @Test
    fun `does not import packets if checksum has not changed`()
    {
        val mockOutpackServerClient = mock<OutpackServerClient> {
            on { getChecksum() } doReturn "1"
        }
        val sut = Scheduler(mockPacketService, mockOutpackServerClient)
        sut.checkPackets()
        verify(mockPacketService, Times(0)).importPackets()
    }
}
