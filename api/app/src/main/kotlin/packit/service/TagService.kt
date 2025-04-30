package packit.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.PageablePayload
import packit.model.Tag
import packit.repository.TagRepository

interface TagService
{
    fun getTags(pageablePayload: PageablePayload, filterName: String): Page<Tag>
    fun getTag(id: Int): Tag
}

@Service
class BaseTagService(
    private val tagRepository: TagRepository
) : TagService
{
    override fun getTags(pageablePayload: PageablePayload, filterName: String): Page<Tag>
    {
        val pageable = PageRequest.of(
            pageablePayload.pageNumber,
            pageablePayload.pageSize,
            Sort.by("name")
        )
        return tagRepository.findAllByNameContaining(filterName, pageable)
    }

    override fun getTag(id: Int): Tag
    {
        return tagRepository.findById(id)
            .orElseThrow { PackitException("tagNotFound", HttpStatus.NOT_FOUND) }
    }
}
