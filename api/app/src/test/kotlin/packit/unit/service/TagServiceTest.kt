package packit.unit.service

import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import packit.model.PageablePayload
import packit.model.Tag
import packit.repository.TagRepository
import packit.service.BaseTagService
import kotlin.test.assertEquals

class TagServiceTest
{
    private val tagRepository = mock<TagRepository>()

    @Test
    fun `getTags calls repository with correct params and returns its result`()
    {
        val pageablePayload = PageablePayload(pageNumber = 0, pageSize = 10)
        val filterName = "tag"
        val tags = listOf(Tag(name = "tag1"), Tag(name = "tag2"))
        val page = PageImpl(tags)
        whenever(
            tagRepository.findAllByNameContaining(
                eq(filterName), any<Pageable>()
            )
        ).thenReturn(page)
        val baseTagService = BaseTagService(tagRepository)

        val result = baseTagService.getTags(pageablePayload, filterName)

        assertEquals(tags, result.content)
        verify(tagRepository).findAllByNameContaining(
            filterName, PageRequest.of(
                pageablePayload.pageNumber,
                pageablePayload.pageSize,
                Sort.by("name")
            )
        )
    }
}