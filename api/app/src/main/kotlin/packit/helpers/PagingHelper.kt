package packit.helpers

import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import packit.model.PageablePayload
import kotlin.math.min

object PagingHelper {
    fun <T> convertListToPage(list: List<T>, pageablePayload: PageablePayload): Page<T> {
        val pageable = PageRequest.of(
            pageablePayload.pageNumber,
            pageablePayload.pageSize,
        )
        val start = pageable.offset.toInt()
        val end = min((start + pageable.pageSize), list.size)

        return PageImpl(list.subList(start, end), pageable, list.size.toLong())
    }
}
