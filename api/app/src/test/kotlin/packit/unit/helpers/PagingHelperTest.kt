package packit.unit.helpers

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.assertThrows
import packit.helpers.PagingHelper
import packit.model.PageablePayload
import kotlin.test.Test

class PagingHelperTest {
    @Test
    fun `convertListToPage returns correct page when list fits into one page`() {
        val list = listOf(1, 2, 3, 4, 5)
        val pageablePayload = PageablePayload(0, 10)

        val page = PagingHelper.convertListToPage(list, pageablePayload)

        assertEquals(5, page.content.size)
        assertEquals(0, page.number)
        assertEquals(10, page.size)
        assertEquals(1, page.totalPages)
    }

    @Test
    fun `convertListToPage returns correct page when list spans multiple pages`() {
        val list = (1..20).toList()
        val pageablePayload = PageablePayload(1, 10)

        val page = PagingHelper.convertListToPage(list, pageablePayload)

        assertEquals(10, page.content.size)
        assertEquals(1, page.number)
        assertEquals(10, page.size)
        assertEquals(2, page.totalPages)
    }

    @Test
    fun `convertListToPage throws exception empty page when pageNumber exceeds list size`() {
        val list = listOf(1, 2, 3, 4, 5)
        val pageablePayload = PageablePayload(2, 10)

        assertThrows<IllegalArgumentException> {
            PagingHelper.convertListToPage(list, pageablePayload)
        }
    }

    @Test
    fun `convertListToPage returns empty page when list is empty`() {
        val list = emptyList<Int>()
        val pageablePayload = PageablePayload(0, 10)

        val page = PagingHelper.convertListToPage(list, pageablePayload)

        assertTrue(page.content.isEmpty())
        assertEquals(0, page.number)
        assertEquals(10, page.size)
        assertEquals(0, page.totalPages)
    }

    @Test
    fun `convertListToPage throws exception when pageNumber is negative`() {
        val list = (1..20).toList()
        val pageablePayload = PageablePayload(-1, 10)

        assertThrows<IllegalArgumentException> {
            PagingHelper.convertListToPage(list, pageablePayload)
        }
    }

    @Test
    fun `convertListToPage throws exception when pageSize is zero`() {
        val list = (1..20).toList()
        val pageablePayload = PageablePayload(0, 0)

        assertThrows<IllegalArgumentException> {
            PagingHelper.convertListToPage(list, pageablePayload)
        }
    }

    @Test
    fun `convertListToPage throws exception when pageSize is negative`() {
        val list = (1..20).toList()
        val pageablePayload = PageablePayload(0, -1)

        assertThrows<IllegalArgumentException> {
            PagingHelper.convertListToPage(list, pageablePayload)
        }
    }
}
