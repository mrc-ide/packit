package packit.unit.model

import org.junit.jupiter.api.assertThrows
import packit.model.Tag
import packit.model.toDto
import kotlin.test.Test
import kotlin.test.assertEquals

class TagTest
{
    @Test
    fun `toDto returns correct TagDto for given Tag`()
    {
        val tag = Tag("tag1", id = 1)
        val tagDto = tag.toDto()
        assertEquals("tag1", tagDto.name)
        assertEquals(1, tagDto.id)
    }

    @Test
    fun `toDto throws NullPointerException for Tag with null id`()
    {
        val tag = Tag("tag1")
        assertThrows<NullPointerException> { tag.toDto() }
    }
}