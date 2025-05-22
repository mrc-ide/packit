package packit.controllers

import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import packit.model.PageablePayload
import packit.model.dto.TagDto
import packit.model.toDto
import packit.service.TagService

@Controller
@RequestMapping("/tag")
class TagController(
    private val tagService: TagService
) {
    @GetMapping
    fun getTags(
        @RequestParam(required = false, defaultValue = "0") pageNumber: Int,
        @RequestParam(required = false, defaultValue = "50") pageSize: Int,
        @RequestParam(required = false, defaultValue = "") filterName: String,
    ): ResponseEntity<Page<TagDto>> {
        val payload = PageablePayload(pageNumber, pageSize)

        return ResponseEntity.ok(tagService.getTags(payload, filterName).map { it.toDto() })
    }
}
